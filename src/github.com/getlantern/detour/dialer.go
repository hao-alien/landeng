package detour

import (
	"errors"
	"fmt"
	"net"
	"sync/atomic"
	"time"
)

type dialFunc func(network, addr string) (net.Conn, error)

// Dialer returns a function with same signature of net.Dialer.Dial().
func Dialer(detourDialer dialFunc) func(network, addr string) (net.Conn, error) {
	return func(network, addr string) (net.Conn, error) {
		dc := &Conn{
			addr:            addr,
			chConnToIOLoop:  make(chan conn),
			chClose:         make(chan struct{}),
			chReadRequest:   make(chan ioRequest),
			chWriteRequest:  make(chan ioRequest),
			chDialDetourNow: make(chan struct{}),
			chGetAddr:       make(chan getAddrRequest),
		}

		type dialResult struct {
			c   conn
			err error
		}
		ch := make(chan dialResult)
		dc.expectedConns = 1
		if !whitelisted(addr) {
			dc.expectedConns = 2
		}

		// Dialing logic
		numDial := int(dc.expectedConns)
		chLastError := make(chan error, numDial)
		go func() {
			if numDial == 2 {
				go func() {
					c, err := dialDirect(network, addr)
					ch <- dialResult{c, err}
				}()
				dt := time.NewTimer(DelayBeforeDetour)
				defer dt.Stop()
				select {
				case <-dt.C:
				case <-dc.chDialDetourNow:
				}
				if dc.anyDataReceived() {
					ch <- dialResult{nil, errors.New("no need to dial detour")}
					return
				}
			}
			c, err := dialDetour(network, addr, detourDialer)
			ch <- dialResult{c, err}
		}()

		// Merge dialing results. Run until all dialing attempts return
		// but notify caller as soon as any connection available.
		go func() {
			var res dialResult
			for i := 0; i < numDial; i++ {
				res = <-ch
				if res.err != nil {
					atomic.AddUint32(&dc.expectedConns, ^uint32(0))
					continue
				}
				// prevent goroutine from blocking if
				// I/O loop already exited, or lots of
				// CLOSE_WAIT connections will be left.
				select {
				case dc.chConnToIOLoop <- res.c:
					chLastError <- nil
				default:
					log.Tracef(
						"%s connection to %s established too late, closing",
						res.c.Type(), dc.addr)
					closeConn(res.c)
				}
			}
			// caller will receive error only if no connection available.
			chLastError <- res.err
		}()

		go dc.ioLoop()
		t := time.NewTimer(TimeoutToConnect)
		defer t.Stop()
		// Wait for first available connection and return, or fail if
		// none available.
		select {
		case lastError := <-chLastError:
			if lastError != nil {
				return nil, lastError
			}
			return dc, nil
		case <-t.C:
			return nil, fmt.Errorf("Timeout dialing any connection to %s", addr)
		}
	}
}
