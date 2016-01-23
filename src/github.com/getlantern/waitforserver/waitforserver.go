// package waitforserver provides functions to wait for a server at given
// address being up or down.
//
// Typical usage:
//
//   import (
//     "time"
//
//     . "github.com/getlantern/waitforserver"
//   )
//
//   func doStuff() {
//     // start a server at localhost:5234
//     if err := WaitForServer("tcp", "localhost:5234", 10 * time.Second); err != nil {
//       // handle failure
//     }
//   }
//}
package waitforserver

import (
	"fmt"
	"net"
	"time"
)

// WaitForServer waits for a server speaking the given protocol to be listening
// at the given address, waiting up to the given limit and reporting an error if
// the server didn't start within the time limit.
func WaitForServer(protocol string, addr string, limit time.Duration) error {
	return WaitForServerUp(protocol, addr, limit)
}

// WaitForServerUp waits for a server speaking the given protocol to be
// listening at the given address, waiting up to the given limit and reporting
// an error if the server didn't start within the time limit.
func WaitForServerUp(protocol string, addr string, limit time.Duration) error {
	cutoff := time.Now().Add(limit)
	for {
		if time.Now().After(cutoff) {
			return fmt.Errorf("Server never came up at %s address %s", protocol, addr)
		}
		c, err := net.DialTimeout(protocol, addr, limit)
		if err == nil {
			return c.Close()
		}
		time.Sleep(50 * time.Millisecond)
	}
}

// WaitForServerDown waits for a server speaking the given protocol to stop
// listening at the given address, waiting up to the given limit and reporting
// an error if the server didn't start within the time limit, with each attempt
// at dialing timing out within dialTimeout.
func WaitForServerDown(protocol string, addr string, limit time.Duration,
	dialTimeout time.Duration) error {
	cutoff := time.Now().Add(limit)
	for {
		if time.Now().After(cutoff) {
			return fmt.Errorf("Server never went down at %s address %s", protocol, addr)
		}
		c, err := net.DialTimeout(protocol, addr, dialTimeout)
		if err == nil {
			c.Close()
		} else {
			return nil
		}
		time.Sleep(50 * time.Millisecond)
	}
}
