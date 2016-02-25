package detour

import (
	"bufio"
	"net"
)

// A Conn that buffers writes
type bufferedConn struct {
	net.Conn
	out *bufio.Writer
}

func newBufferedConn(bufferSize int, orig net.Conn) net.Conn {
	return &bufferedConn{
		Conn: orig,
		out:  bufio.NewWriterSize(orig, bufferSize),
	}
}

func (conn *bufferedConn) Write(b []byte) (n int, err error) {
	return conn.out.Write(b)
}

func (conn *bufferedConn) Close() error {
	conn.out.Flush()
	return conn.Conn.Close()
}
