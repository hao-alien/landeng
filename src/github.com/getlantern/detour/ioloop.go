package detour

import (
	"bytes"
	"io"
	"sync/atomic"
	"time"
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
	// It's not safe to access it from multiple goroutines.
	conns := newConnQueue(2)
	// Requests ioLoop to remove already closed connections.
	chRemoveConn := make(chan conn)
	// Hold the read request so we can re-read after replay.
	var firstReadReq *innerReadRequest

	// Can we replay this request
	// TODO: How to check when using pipelining or HTTP/2?
	var nonidempotentHTTPRequest bool

	ticker := time.NewTicker(10 * time.Second)
	defer ticker.Stop()

	for {
		select {
		case <-ticker.C:
			log.Tracef("Waited 10s on connection to %s, dumping internal state", dc.addr)
			dc.dumpInternal()
		case c := <-dc.chConnToIOLoop:
			reRead := false
			if dc.anyDataReceived() {
				log.Tracef("%s connection to %s available after data received, closing", c.Type(), dc.addr)
				dc.closeAndDecrease(c)
				continue
			}
			if firstReadReq != nil {
				if nonidempotentHTTPRequest {
					// TODO: It incorrectly adds directly
					// accessible sites to whitelist. Should
					// determine whitelist a site or not at a
					// single point. Skipping it should not
					// cause any problem, as idempotent
					// requests to the same site can also
					// be blocked, hence adds the site to
					// whitelist.
					//
					// log.Tracef("Not replay nonidempotent request to %s, only add to whitelist", dc.addr)
					// AddToWl(dc.addr, false)
					log.Tracef("Not replay nonidempotent request to %s", dc.addr)
					dc.closeAndDecrease(c)
					continue
				}
				if !dc.replay(c) {
					dc.closeAndDecrease(c)
					continue
				}
				reRead = true
			}
			conns.Add(c)
			// spawn goroutine after above statement so channel
			// operations are in determined order.
			if reRead {
				go func() {
					log.Tracef("Re-read from %s connection to %s", c.Type(), dc.addr)
					buf := make([]byte, len(firstReadReq.buf))
					n, err := c.Read(buf, true)
					atomic.AddUint32(&dc.reread, 1)
					select {
					case firstReadReq.chResult <- innerReadResult{c, buf[:n], err}:
					case <-dc.chClose:
					}
				}()
			}

		case r := <-chRemoveConn:
			conns.Remove(r)
			atomic.AddUint32(&dc.expectedConns, ^uint32(0))

		case req := <-dc.chReadRequest:
			atomic.AddUint32(&dc.numReadRequests, 1)
			if atomic.LoadUint32(&dc.expectedConns) == 1 {
				c := conns.Next()
				go func() {
					n, err := c.Read(req.buf, false)
					atomic.AddUint32(&dc.numReads, 1)
					log.Tracef("Read %d bytes via %s connection to %s, err: %v", n, c.Type(), dc.addr, err)
					if err != nil && err != io.EOF && c.Type() == connTypeDetour {
						log.Tracef("Detour connection to %s failed, removing from whitelist", dc.addr)
						RemoveFromWl(dc.addr)
					}
					req.chResult <- ioResult{n, err}
				}()
				continue
			}
			chMergeReads := make(chan innerReadResult)
			first := !dc.anyDataReceived()
			if first {
				firstReadReq = &innerReadRequest{req.buf, chMergeReads}
			}
			// read from all current connections, typically only one
			conns.Foreach(func(c conn) bool {
				r := &reader{
					c:            c,
					chMerge:      chMergeReads,
					chDialDetour: dc.chDialDetourNow,
					buf:          make([]byte, len(req.buf)),
					first:        first,
					addr:         dc.addr,
					chClose:      dc.chClose,
				}
				go r.run()
				atomic.AddUint32(&dc.numReads, 1)
				return true
			})
			go func() {
				// Merge read responses, return first succeeded
				// one to caller and ignore another, or return the
				// last error if both failed.
				m := merger{
					chMerge:       chMergeReads,
					expectedConns: &dc.expectedConns,
					addr:          dc.addr,
					req:           &req,
					chClose:       dc.chClose,
				}
				connsToRemove := m.run()
				for _, c := range connsToRemove {
					// select on dc.chClose to avoid blocking
					// on a channel with no receiver.  same
					// hereafter.
					select {
					case <-dc.chClose:
					case chRemoveConn <- c:
					}
				}
			}()

		case req := <-dc.chWriteRequest:
			atomic.AddUint32(&dc.numWriteRequests, 1)
			if atomic.LoadUint32(&dc.expectedConns) == 1 {
				c := conns.Next()
				go func() {
					n, err := c.Write(req.buf)
					atomic.AddUint32(&dc.numWrites, 1)
					log.Tracef("Wrote %d bytes via %s connection to %s, err: %v", n, c.Type(), dc.addr, err)
					req.chResult <- ioResult{n, err}
				}()
				continue
			}
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
			var lastError error
			conns.Foreach(func(c conn) bool {
				n, err := c.Write(req.buf)
				atomic.AddUint32(&dc.numWrites, 1)
				if err != nil {
					log.Debugf("Error write to %s connection to %s", c.Type(), dc.addr)
					dc.closeAndDecrease(c)
					// intentionally not return c to chConns
					return false
				} else {
					log.Tracef("Wrote %v bytes to %s connection to %s", n, c.Type(), dc.addr)
					lastN = n
					return true
				}
			})
			if lastN > 0 {
				req.chResult <- ioResult{lastN, nil}
			} else {
				// simply return last error so caller can have a sense of what happening
				req.chResult <- ioResult{0, lastError}
			}

		case req := <-dc.chGetAddr:
			if conns.Len() == 0 {
				panic("should have at least one valid connection")
			}
			c := conns.Next()
			if req.isLocal {
				req.chResult <- c.LocalAddr()
			} else {
				req.chResult <- c.RemoteAddr()
			}

		case <-dc.chClose:
			conns.Foreach(func(c conn) bool {
				closeConn(c)
				return false
			})
			return
		}
	}
}

func (dc *Conn) replay(c conn) bool {
	atomic.AddUint32(&dc.replayed, 1)
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
func (dc *Conn) closeAndDecrease(c conn) {
	closeConn(c)
	atomic.AddUint32(&dc.expectedConns, ^uint32(0))
}

func (dc *Conn) dumpInternal() {
	var format = `Dest addr: %s,
Read bytes: %d,
expectedConns: %d,
closed: %v,
numReadRequests: %d,
numReads: %d,
numWriteRequests: %d,
numWrites: %d,
replayed: %v,
reread: %v
`
	log.Tracef(format,
		dc.addr,
		atomic.LoadUint64(&dc.readBytes),
		atomic.LoadUint32(&dc.expectedConns),
		atomic.LoadUint32(&dc.closed) == 1,
		atomic.LoadUint32(&dc.numReadRequests),
		atomic.LoadUint32(&dc.numReads),
		atomic.LoadUint32(&dc.numWriteRequests),
		atomic.LoadUint32(&dc.numWrites),
		atomic.LoadUint32(&dc.replayed),
		atomic.LoadUint32(&dc.reread),
	)
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
	n, err := r.c.Read(r.buf, r.first)
	log.Tracef("Read %d bytes via %s connection to %s, first: %v, err: %v", n, r.c.Type(), r.addr, r.first, err)
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
			if err != io.EOF {
				log.Tracef("Detour connection to %s failed, removing from whitelist", r.addr)
				RemoveFromWl(r.addr)
			}
		}
	}
	select {
	case r.chMerge <- innerReadResult{r.c, r.buf[:n], err}:
	case <-r.chClose:
	}
}

type merger struct {
	chMerge       chan innerReadResult
	expectedConns *uint32
	addr          string
	req           *ioRequest
	chClose       chan struct{}
}

func (m *merger) run() (connsToRemove []conn) {
	var got bool
	var i uint32 = 0
	for ; i < atomic.LoadUint32(m.expectedConns); i++ {
		var result innerReadResult
		select {
		case result = <-m.chMerge:
		case <-m.chClose:
			close(m.req.chResult)
			return
		}
		c, buf, n, err := result.c, result.buf, len(result.buf), result.err
		if err != nil && err != io.EOF {
			log.Debugf("Read from %s connection to %s failed, closing: %s", c.Type(), m.addr, err)
			closeConn(c)
			connsToRemove = append(connsToRemove, c)
			if i == 0 && c.Type() == connTypeDirect {
				log.Tracef("Ignore first error from %s connection to %s: %s", c.Type(), m.addr, result.err)
				// we know that reads from detour connection will come soon unless we failed to connect it.
				// It does no harm in that case, as m.chClose will prevent the goroutine from wait infinitely.
				continue
			}
		} else {
			log.Tracef("Read %d bytes from %s connection to %s", n, c.Type(), m.addr)
		}
		if got {
			log.Tracef("Ignore late copy of response from %s connection to %s", c.Type(), m.addr)
			closeConn(c)
			connsToRemove = append(connsToRemove, c)
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
