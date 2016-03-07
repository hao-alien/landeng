package balancer

import (
	"io"
	"net"
	"sync/atomic"
)

type errorCounted struct {
	net.Conn
	counter *int32
}

func (c *errorCounted) Read(b []byte) (n int, err error) {
	n, err = c.Conn.Read(b)
	c.countErrors(err)
	return
}

func (c *errorCounted) Write(b []byte) (n int, err error) {
	n, err = c.Conn.Write(b)
	c.countErrors(err)
	return
}

func (c *errorCounted) countErrors(err error) {
	switch err {
	case io.ErrUnexpectedEOF:
		fallthrough
	case io.ErrShortWrite:
		fallthrough
	case io.ErrClosedPipe:
		fallthrough
	case io.ErrNoProgress:
		fallthrough
	case io.ErrShortBuffer:
		log.Debugf("Increased error: %+v", err)
		atomic.AddInt32(c.counter, 1)
	default:
		if _, ok := err.(net.Error); ok {
			log.Debugf("Increased net.Error: %+v", err)
			atomic.AddInt32(c.counter, 1)
		}
	}
}
