package detour

import (
	"fmt"
	"net"
	"sync"
	"sync/atomic"
	"time"

	"github.com/getlantern/eventual"
	"github.com/getlantern/golog"
)

var (
	log = golog.LoggerFor("detour")

	// DirectDialTimeout controls the dial timeout for direct connections
	// We make this relatively small because detour won't fail over to a proxied
	// connection until this timeout is hit. The detoured connection is eagerly
	// fetched, so once we fail over the request will complete very quickly, so
	// 5 seconds is a good approximation of our maximum latency for initial
	// detouring.
	DirectDialTimeout = 5 * time.Second

	// BufferSize controls the read and write buffer sizes for connections.
	// Since detour writes to multiple connections simultaneously, buffering
	// allows detour to work with connections that read/write at different rates.
	BufferSize = 65536

	// If DirectAddrCh is set, when a direct connection is closed without any error,
	// the connection's remote address (in host:port format) will be send to it.
	DirectAddrCh = make(chan string)
)

type dialFN func(network, addr string) (net.Conn, error)

func Dialer(isHTTP bool, dialDetour dialFN) dialFN {
	return func(network, addr string) (net.Conn, error) {
		if whitelisted(addr) {
			log.Tracef("Using detour for already whitelisted address: %v", addr)
			return dialDetour(network, addr)
		}

		detourAllowed := eventual.NewValue()

		conn := &dconn{
			direct: dialDirect(network, addr, isHTTP, detourAllowed),
		}

		// Use direct as the initial reader
		conn.reader = conn.direct

		// Set up a detoured connection which we'll use if we have to
		detouredTimeout := DirectDialTimeout * 2
		conn.detoured = newEventualConn(detouredTimeout, BufferSize, func() (net.Conn, error) {
			allowed, ok := detourAllowed.Get(detouredTimeout)
			if !ok || !allowed.(bool) {
				err := fmt.Errorf("Detouring not allowed for %v. Timed out waiting for connection? %v", addr, !ok)
				log.Trace(err)
				return nil, err
			}
			log.Tracef("Dialing detour for %v", addr)
			conn, err := dialDetour(network, addr)
			if err == nil {
				// Prefetch up to 1 MB
				conn = newEagerconn(conn, 1024768)
			}
			return conn, err
		})

		log.Tracef("Returning detour conn for %v", addr)
		return conn, nil
	}
}

type dconn struct {
	direct    net.Conn
	detoured  net.Conn
	reader    net.Conn
	readMutex sync.Mutex
	readFirst int32
}

func (conn *dconn) Write(b []byte) (n int, err error) {
	log.Trace("Writing")
	// We write to both the direct and the detoured connections so that if we have
	// to switch to detoured, we've already done some of the work.
	// Since both connections are buffered, this won't block.
	nd, ed := conn.direct.Write(b)
	nt, et := conn.detoured.Write(b)
	log.Tracef("Wrote")
	if ed == nil {
		return nd, ed
	}
	return nt, et
}

func (conn *dconn) Read(b []byte) (n int, err error) {
	conn.readMutex.Lock()
	defer conn.readMutex.Unlock()
	log.Trace("Reading")
	defer func() {
		log.Trace("Read")
	}()
	if atomic.CompareAndSwapInt32(&conn.readFirst, 0, 1) {
		log.Trace("First read")
		n, err = conn.reader.Read(b)
		log.Trace("Did first read")
		if err != nil && isDetourable(err) {
			log.Trace("Switching to detour")
			conn.reader = conn.detoured
			return conn.reader.Read(b)
		}
		return n, err
	}
	log.Trace("Subsequent read")
	return conn.reader.Read(b)
}

func (conn *dconn) Close() error {
	ed := conn.direct.Close()
	et := conn.detoured.Close()
	if ed != nil {
		return ed
	}
	return et
}

func (conn *dconn) LocalAddr() net.Addr {
	return conn.reader.LocalAddr()
}

func (conn *dconn) RemoteAddr() net.Addr {
	return conn.reader.RemoteAddr()
}

func (conn *dconn) SetDeadline(t time.Time) error {
	ed := conn.direct.SetDeadline(t)
	et := conn.detoured.SetDeadline(t)
	if ed != nil {
		return ed
	}
	return et
}

func (conn *dconn) SetReadDeadline(t time.Time) error {
	ed := conn.direct.SetReadDeadline(t)
	et := conn.detoured.SetReadDeadline(t)
	if ed != nil {
		return ed
	}
	return et
}

func (conn *dconn) SetWriteDeadline(t time.Time) error {
	ed := conn.direct.SetWriteDeadline(t)
	et := conn.detoured.SetWriteDeadline(t)
	if ed != nil {
		return ed
	}
	return et
}
