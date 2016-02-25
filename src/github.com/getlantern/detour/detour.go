/*
Package detour provides a net.Conn interface which detects blockage of a
site automatically and access it through alternative connection.

Basically, if a site is not whitelisted, following steps will be taken:

1. Dial proxied connection (detour) a small delay after dialed directly.

2. Return to caller when any connection is established.

3. Read/write through all open connections in parallel.

4. Check for blockage on direct connection and closes it if it happens.

5. If possible, replay operations on detour connection[1].

6. After sucessfully read from a connection, stick with it and close others.

7. Add those sites failed on direct connection but succeeded on detour ones to
proxied list, so above steps can be skipped next time. The list can be exported
and persisted if required.

8. Caller can optionally provide a channel to receive the sites which can be
accessed directly without any error.

Blockage can happen at several stages of a connection, what detour can detect
are:

1. Connection attempt is blocked (IP blocking / DNS hijack). Symptoms can be
connection time out / connection refused / TCP RST.

2. Connection made but not able to transfer any data (DPI).

3. Successfully sent a few packets, but failed to receive any data[2].

4. Connection made but get fake response or HTTP redirect to a fixed URL.

[1] Detour will not replay nonidempotent plain HTTP requests, but will add it
to proxied list to be detoured next time.
*/
package detour

import (
	"bytes"
	"fmt"
	"net"
	"sync"
	"sync/atomic"
	"time"

	"github.com/getlantern/golog"
)

// If no any connection made after this period, stop dialing and fail
var TimeoutToConnect = 30 * time.Second

// To avoid unnecessarily proxy not-blocked url, detour will dial detour
// connection after this small delay. Set to zero will dial in parallel, hence not
// introducing any delay.
var DelayBeforeDetour = 0 * time.Millisecond

// If DirectAddrCh is set, when a direct connection is closed without any error,
// the connection's remote address (in host:port format) will be send to it.
var DirectAddrCh = make(chan string)

var log = golog.LoggerFor("detour")

// Conn implements an net.Conn interface by utilizing underlie direct and
// detour connections.
type Conn struct {
	// Keeps track of the total bytes read from this connection, atomic
	// Due to https://golang.org/pkg/sync/atomic/#pkg-note-BUG it requires
	// manual alignment. For this, it is best to keep it as the first field
	readBytes uint64

	// number of connections expected to be available now or later.
	expectedConns uint32

	// chan to pass connections from dialer to I/O loop
	chConnToIOLoop chan conn
	// ask I/O loop to read
	chReadRequest chan ioRequest
	// ask I/O loop to write
	chWriteRequest chan ioRequest
	// ask I/O loop to get local or remote addr
	chGetAddr chan getAddrRequest
	// a signal to close connections
	chClose chan struct{}
	// atomic, only used in Close()
	closed uint32
	// The chan to notify dialer to dial detour immediately
	chDialDetourNow chan struct{}

	// the target address to visit
	addr string

	muWriteBuffer sync.RWMutex
	// Keeps written bytes through direct connection to replay it if required.
	writeBuffer bytes.Buffer

	// auxiliary attributes for debugging
	numReadRequests  uint32
	numReads         uint32
	numWriteRequests uint32
	numWrites        uint32
	replayed         uint32
	reread           uint32
}

// Read() implements the function from net.Conn
func (dc *Conn) Read(b []byte) (n int, err error) {
	ch := make(chan ioResult)
	dc.chReadRequest <- ioRequest{b, ch}
	result, ok := <-ch
	if !ok {
		return 0, fmt.Errorf("connection to %s closed during reading", dc.addr)
	}
	n, err = result.n, result.err
	dc.incReadBytes(n)
	return
}

// Write() implements the function from net.Conn
func (dc *Conn) Write(b []byte) (n int, err error) {
	ch := make(chan ioResult)
	dc.chWriteRequest <- ioRequest{b, ch}
	result := <-ch
	return result.n, result.err
}

// Close implements the function from net.Conn
func (dc *Conn) Close() error {
	// prevent multiple call of Close() from panicking
	if atomic.LoadUint32(&dc.closed) == 0 {
		close(dc.chClose)
		atomic.StoreUint32(&dc.closed, 1)
	}
	return nil
}

// LocalAddr implements the function from net.Conn
func (dc *Conn) LocalAddr() (addr net.Addr) {
	chResult := make(chan net.Addr)
	dc.chGetAddr <- getAddrRequest{true, chResult}
	return <-chResult
}

// RemoteAddr implements the function from net.Conn
func (dc *Conn) RemoteAddr() (addr net.Addr) {
	chResult := make(chan net.Addr)
	dc.chGetAddr <- getAddrRequest{false, chResult}
	return <-chResult
}

// SetDeadline implements the function from net.Conn
func (dc *Conn) SetDeadline(t time.Time) error {
	return fmt.Errorf("SetDeadline not implemented")
}

// SetReadDeadline implements the function from net.Conn
func (dc *Conn) SetReadDeadline(t time.Time) error {
	return fmt.Errorf("SetReadDeadline not implemented")
}

// SetWriteDeadline implements the function from net.Conn
func (dc *Conn) SetWriteDeadline(t time.Time) error {
	return fmt.Errorf("SetWriteDeadline not implemented")
}

// pass result of I/O operation back from I/O loop
type ioResult struct {
	// bytes read/wrote
	n int
	// IO error, if any
	err error
}

// pass read/write request to I/O loop
type ioRequest struct {
	buf      []byte
	chResult chan ioResult
}

// pass LocalAddr/RemoteAddr request to I/O loop
type getAddrRequest struct {
	isLocal  bool
	chResult chan net.Addr
}

// common interface for underlie connections
type conn interface {
	Type() connType
	Read(b []byte, isFirst bool) (int, error)
	Write(b []byte) (int, error)
	Close() error
	LocalAddr() net.Addr
	RemoteAddr() net.Addr
}

type connType int

const (
	connTypeDirect connType = iota
	connTypeDetour connType = iota
)

var connTypeDesc = []string{"direct", "detour"}

func (c connType) String() string { return connTypeDesc[c] }

type readBytesCounted struct {
	net.Conn
	readBytes uint64
}

func (c *readBytesCounted) Read(p []byte) (n int, err error) {
	n, err = c.Conn.Read(p)
	if n > 0 {
		atomic.AddUint64(&c.readBytes, uint64(n))
	}
	return
}

func (c *readBytesCounted) anyDataReceived() bool {
	return atomic.LoadUint64(&c.readBytes) > 0
}
