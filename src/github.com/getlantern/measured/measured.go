/*
measured wraps a dialer to measure the delay, throughput and errors of the connection made.
A list of reporters can be plugged in to distribute the results to different target.
*/
package measured

import (
	"net"
	"strings"
	//	"time"
)

type Stats struct {
	Instance     string
	Server       string
	BytesRead    uint64
	BytesWritten uint64
	Errors       map[string]int
}

type Reporter interface {
	Submit(Stats) error
}

var reporters []Reporter

type dialFunc func(net, addr string) (net.Conn, error)

func AddReporter(r Reporter) {
	reporters = append(reporters, r)
}

func Dialer(d dialFunc) dialFunc {
	return func(net, addr string) (net.Conn, error) {
		c, err := d(net, addr)
		if err != nil {
			reportError(net, addr, err)
		}
		return measuredConn{c, new(counter)}, err
	}
}

func reportError(net, addr string, err error) {
	splitted := strings.Split(err.Error(), ":")
	e := strings.Trim(splitted[len(splitted)-1], " ")
	for _, r := range reporters {
		r.Submit(Stats{
			Server: addr,
			Errors: map[string]int{e: 1},
		})
	}
}

type measuredConn struct {
	net.Conn
	c *counter
}

// Read() implements the function from net.Conn
func (mc measuredConn) Read(b []byte) (n int, err error) {
	//start := time.Now()
	n, err = mc.Conn.Read(b)
	//mc.c.OnRead(n, err, time.Now()-start)
	return
}

// Write() implements the function from net.Conn
func (mc measuredConn) Write(b []byte) (n int, err error) {
	//start := time.Now()
	n, err = mc.Conn.Write(b)
	//mc.c.OnWrite(n, err, time.Now()-start)
	return
}

// Close() implements the function from net.Conn
func (mc measuredConn) Close() (err error) {
	//start := time.Now()
	err = mc.Conn.Close()
	//mc.c.OnClose(err, time.Now()-start)
	return
}

type counter struct {
}
