package detour

import (
	"net"
	"sync/atomic"
)

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
