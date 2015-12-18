package detour

import (
	"bytes"
	"errors"
	"sync/atomic"
)

// to pass result of read operation to merger from underlie connection
type innerReadResult struct {
	// the connection which performs this read
	c conn
	// buffer holding received data, it's not necessarily the same
	// buffer as innerReadRequest.
	buf []byte
	// IO error, if any
	err error
}

type innerReadRequest struct {
	buf      []byte
	chResult chan innerReadResult
}

// ioLoop is the core of detour. It waits for connections and handles
// read/write requests
func (dc *Conn) ioLoop() {
	// Use buffered channel in same goroutine so we can easily add / remove
	// connections. Should switch to container/ring if performace matters.
	chConns := make(chan conn, 2)
	// Requests ioLoop to remove already closed connections.
	chRemoveConn := make(chan conn)
	// Hold the read request so we can re-read after replay.
	var firstReadReq *innerReadRequest

	// Can we replay this request
	// TODO: How to check when using pipelining or HTTP/2?
	var nonidempotentHTTPRequest bool

	for {
		select {
		case c := <-dc.chConnToIOLoop:
			if dc.anyDataReceived() {
				log.Tracef("%s connection to %s available after data received, closing", c.Type(), dc.addr)
				closeConn(c)
				continue
			}
			reRead := false
			if firstReadReq != nil {
				if nonidempotentHTTPRequest {
					log.Tracef("Not replay nonidempotent request to %s, only add to whitelist", dc.addr)
					AddToWl(dc.addr, false)
					closeConn(c)
					continue
				}
				if !dc.replay(c) {
					closeConn(c)
					continue
				}
				reRead = true
			}
			chConns <- c
			// spawn goroutine after above statement so channel
			// operations are in determined order.
			if reRead {
				go func() {
					log.Tracef("Re-read from %s connection to %s", c.Type(), dc.addr)
					buf := make([]byte, len(firstReadReq.buf))
					n, err := c.Read(buf, true)
					select {
					case firstReadReq.chResult <- innerReadResult{c, buf[:n], err}:
					case <-dc.chClose:
						close(firstReadReq.chResult)
					}
				}()
			}
		case r := <-chRemoveConn:
			tries := len(chConns)
			for i := 0; i < tries; i++ {
				c := <-chConns
				if c != r {
					chConns <- c
				}
			}
		case req := <-dc.chReadRequest:
			chMergeReads := make(chan innerReadResult)
			first := !dc.anyDataReceived()
			if first {
				firstReadReq = &innerReadRequest{req.buf, chMergeReads}
			}
			tries := len(chConns)
			// read from all valid connections, typically only one
			for i := 0; i < tries; i++ {
				c := <-chConns
				chConns <- c
				buf := make([]byte, len(req.buf))
				r := &reader{
					c:            c,
					chMerge:      chMergeReads,
					chDialDetour: dc.chDialDetourNow,
					buf:          buf,
					first:        first,
					addr:         dc.addr,
					chClose:      dc.chClose,
				}
				go r.run()
			}

			go func() {
				// Merge read responses, return first succeeded
				// one to caller and ignore later, or return the
				// last error if both failed.
				m := merger{
					chMerge: chMergeReads,
					addr:    dc.addr,
					tries:   tries,
					req:     &req,
					chClose: dc.chClose,
				}
				connsToRemove := m.run()
				for _, c := range connsToRemove {
					// select on dc.chClose to avoid
					// blocking on a channel with no receiver.
					// same hereafter.
					select {
					case <-dc.chClose:
					case chRemoveConn <- c:
					}
				}
			}()

		case req := <-dc.chWriteRequest:
			if !dc.anyDataReceived() {
				if isNonidempotentHTTPRequest(req.buf) {
					nonidempotentHTTPRequest = true
				} else {
					dc.muWriteBuffer.Lock()
					_, _ = dc.writeBuffer.Write(req.buf)
					dc.muWriteBuffer.Unlock()
				}
			}
			var lastN int
			tries := len(chConns)
			for i := 0; i < tries; i++ {
				c := <-chConns
				if n, err := c.Write(req.buf); err != nil {
					log.Debugf("Error write to %s connection to %s", c.Type(), dc.addr)
					closeConn(c)
					// intentionally not return c to chConns
				} else {
					log.Tracef("Wrote %v bytes to %s connection to %s", n, c.Type(), dc.addr)
					lastN = n
					chConns <- c
				}
			}
			if lastN > 0 {
				req.chResult <- ioResult{lastN, nil}
			} else {
				req.chResult <- ioResult{0, errors.New("fail to write to any connection")}
			}
		case req := <-dc.chGetAddr:
			if len(chConns) == 0 {
				panic("should have at least one valid connection")
			}
			c := <-chConns
			chConns <- c
			if req.isLocal {
				req.chResult <- c.LocalAddr()
			} else {
				req.chResult <- c.RemoteAddr()
			}
		case <-dc.chClose:
			tries := len(chConns)
			for i := 0; i < tries; i++ {
				closeConn(<-chConns)
			}
			return
		}
	}
}

func (dc *Conn) replay(c conn) bool {
	dc.muWriteBuffer.RLock()
	defer dc.muWriteBuffer.RUnlock()
	numBytes := dc.writeBuffer.Len()
	if numBytes == 0 {
		return false
	}
	log.Tracef("Replay %d previous bytes to %s connection to %s", numBytes, c.Type(), dc.addr)
	if _, err := c.Write(dc.writeBuffer.Bytes()); err != nil {
		log.Debugf("Fail to replay %s bytes to %s: %s", numBytes, dc.addr, err)
		return false
	}
	return true
}

func (dc *Conn) anyDataReceived() bool {
	return atomic.LoadUint64(&dc.readBytes) > 0
}

func (dc *Conn) incReadBytes(n int) {
	atomic.AddUint64(&dc.readBytes, uint64(n))
}

// close with trace
func closeConn(c conn) {
	if err := c.Close(); err != nil {
		log.Tracef("Error close %s connection to %s: %s", c.Type(), c.RemoteAddr().String(), err)
	}
}

var nonidempotentMethods = [][]byte{
	[]byte("PUT "),
	[]byte("POST "),
	[]byte("PATCH "),
}

// Ref https://tools.ietf.org/html/rfc2616#section-9.1.2
// We consider the https handshake phase to be idemponent.
func isNonidempotentHTTPRequest(b []byte) bool {
	if len(b) > 4 {
		for _, m := range nonidempotentMethods {
			if bytes.HasPrefix(b, m) {
				return true
			}
		}
	}
	return false
}

type reader struct {
	c            conn
	chMerge      chan innerReadResult
	chDialDetour chan struct{}
	buf          []byte
	first        bool
	addr         string
	chClose      chan struct{}
}

func (r *reader) run() {
	log.Tracef("Read via %s connection to %s, first: %v", r.c.Type(), r.addr, r.first)
	n, err := r.c.Read(r.buf, r.first)
	if err != nil {
		switch r.c.Type() {
		case connTypeDirect:
			// if we haven't dial detour yet, do so now
			// just a hint, skip if no receiver
			select {
			case r.chDialDetour <- struct{}{}:
			default:
			}
		case connTypeDetour:
			log.Tracef("Detour connection to %s failed, removing from whitelist", r.addr)
			RemoveFromWl(r.addr)
		}
	} else {
	}
	select {
	case r.chMerge <- innerReadResult{r.c, r.buf[:n], err}:
	case <-r.chClose:
	}
}

type merger struct {
	chMerge chan innerReadResult
	addr    string
	tries   int
	req     *ioRequest
	chClose chan struct{}
}

func (m *merger) run() (connsToRemove []conn) {
	var got bool
	merges := m.tries
	for i := 0; i < merges; i++ {
		var result innerReadResult
		select {
		case result = <-m.chMerge:
		case <-m.chClose:
			close(m.req.chResult)
			return
		}
		c, buf, n, err := result.c, result.buf, len(result.buf), result.err
		if err != nil {
			log.Tracef("Read from %s connection to %s failed, closing: %s", c.Type(), m.addr, err)
			closeConn(c)
			connsToRemove = append(connsToRemove, c)
			if i == 0 && c.Type() == connTypeDirect {
				log.Debugf("Ignore first error from %s connection to %s: %s", c.Type(), m.addr, result.err)
				// we know that reads from detour connection will come unless we failed to connect it.
				// It does few harm if so, as m.chClose will prevent the goroutine from wait infinitely.
				merges = 2
				continue
			}
		} else {
			log.Tracef("Read %d bytes from %s connection to %s", n, c.Type(), m.addr)
		}
		if got {
			log.Tracef("Ignore late copy of response from %s", m.addr)
			continue
		}
		if n > 0 {
			_ = copy(m.req.buf, buf)
		}
		select {
		case m.req.chResult <- ioResult{n, result.err}:
			got = true
		case <-m.chClose:
			close(m.req.chResult)
			return
		}
	}
	return
}
