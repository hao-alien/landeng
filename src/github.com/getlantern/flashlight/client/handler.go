package client

import (
	"fmt"
	"io"
	"net"
	"net/http"
	"runtime"
	"strconv"
	"sync"

	"github.com/getlantern/detour"
)

const (
	httpConnectMethod  = "CONNECT" // HTTP CONNECT method
	httpXFlashlightQOS = "X-Flashlight-QOS"
	maxReqRetries      = 3
)

// ServeHTTP implements the method from interface http.Handler using the latest
// handler available from getHandler() and latest ReverseProxy available from
// getReverseProxy().
func (client *Client) ServeHTTP(resp http.ResponseWriter, req *http.Request) {
	if req.Method == httpConnectMethod {
		// CONNECT requests are often used for HTTPS requests.
		log.Tracef("Intercepting CONNECT %s", req.URL)
		client.intercept(resp, req)
	} else {
		// Direct proxying can only be used for plain HTTP connections.
		log.Tracef("Reverse proxying %s %v", req.Method, req.URL)
		client.getReverseProxy().ServeHTTP(resp, req)
	}
}

// intercept intercepts an HTTP CONNECT request, hijacks the underlying client
// connetion and starts piping the data over a new net.Conn obtained from the
// given dial function.
func (client *Client) intercept(resp http.ResponseWriter, req *http.Request) {

	if req.Method != httpConnectMethod {
		panic("Intercept used for non-CONNECT request!")
	}

	var err error
	var clientConn net.Conn
	var connOut net.Conn

	// Make sure of closing connections only once
	var closeOnce sync.Once
	closeBothConns := func() {
		// TODO: We shouldn't close clientConn too soon, since we are going to retry
		// if responses fail
		if clientConn != nil {
			if err := clientConn.Close(); err != nil {
				log.Debugf("Error closing the client connection: %s", err)
			}
		}
		if connOut != nil {
			if err := connOut.Close(); err != nil {
				log.Debugf("Error closing the server connection: %s", err)
			}
		}
	}
	defer closeOnce.Do(closeBothConns)

	// Hijack underlying connection.
	if clientConn, _, err = resp.(http.Hijacker).Hijack(); err != nil {
		respondBadGateway(resp, fmt.Sprintf("Unable to hijack connection: %s", err))
		return
	}

	// Establish outbound connection.
	addr := hostIncludingPort(req, 443)
	connOut, err = client.dialServer(addr, req)
	if err != nil {
		respondBadGateway(clientConn, fmt.Sprintf("Unable to handle CONNECT request: %s", err))
		return
	}

	// Respond OK.
	err = respondOK(clientConn, req)
	if err != nil {
		log.Errorf("Unable to respond OK: %s", err)
		return
	}

	// Pipe data between the client and the proxy.
	received, ok := pipeData(clientConn, connOut)

	retry := maxReqRetries
	closeOnlyClientConn := func() {
		// Close the only the remaining connection (proxy server connection is already closed)
		closeOnce.Do(func() {})
		if err := clientConn.Close(); err != nil {
			log.Errorf("Error closing the client connection: %s", err)
		}
	}
	for {
		// OK means that piping already finished successfully in both directions. Otherwise, we need
		// to check that no response has been initiated yet
		if ok {
			return
		} else {
			// If no bytes have been received, we can just retry the request to the proxy server.
			if received == 0 {
				// Retry the server connection
				// TODO: we need to do make sure we don't end up repeating dialers from the balancer
				connOut, err = client.dialServer(addr, req)
				// We've responded already with 200 OK or 502 Bad gateway, so we will just retry. If
				// this is the last retry, then connections will be just closed.
				if err != nil {
					continue
				}

				received, ok = pipeData(clientConn, connOut)
			} else {
				// TODO: Handle case where piping failed after some bytes were received
				log.Errorf("********* Request failed when response had already started")
				closeOnlyClientConn()
				return
			}
		}
		retry--
		if retry == 0 && !ok {
			closeOnlyClientConn()
			break
		}
	}
}

// pipeData pipes data between the client and proxy connections. It returns the number
// of received bytes, and a boolean value for a successful bidirectional piping.
// This function closes the connOut connection if any direction of the piping failed,
// so it can eventually be recovered
func pipeData(clientConn net.Conn, connOut net.Conn) (received int64, ok bool) {
	pipeErrors := make(chan error, 2)

	var once sync.Once
	closeOutConn := func() {
		// Force closing connection with proxy server only, so we can try to
		// recover and continue data transmission to the client. This will
		// stop copying in both directions, no matter which one caused the
		// connOut to close.
		if err := connOut.Close(); err != nil {
			log.Errorf("Error closing the server connection: %s", err)
		}
	}

	// Start piping from client to proxy
	go func() {
		log.Debugf("======================== Piping data from client to proxy")
		_, err := io.Copy(connOut, clientConn)
		if err != nil {
			log.Debugf("======================== Error piping data from client to proxy: %s", err)
			pipeErrors <- err
			// Close the proxy server connection only if there was an error
			once.Do(closeOutConn)
		}
	}()

	// Then start copying from proxy to client.
	log.Debugf("======================== Piping data from proxy to client")
	n, err := io.Copy(clientConn, connOut)
	if err != nil {
		log.Debugf("======================== Error piping data from proxy to client: %s", err)
		pipeErrors <- err
		// Close the proxy server connection only if there was an error
		once.Do(closeOutConn)
	}

	select {
	case <-pipeErrors:
		return n, false
	default:
		return n, true
	}
}

// targetQOS determines the target quality of service given the X-Flashlight-QOS
// header if available, else returns MinQOS.
func (client *Client) targetQOS(req *http.Request) int {
	requestedQOS := req.Header.Get(httpXFlashlightQOS)

	if requestedQOS != "" {
		rqos, err := strconv.Atoi(requestedQOS)
		if err == nil {
			return rqos
		}
	}

	return client.MinQOS
}

// dialServer will open a TCP connection with a server provided by the balancer
func (client *Client) dialServer(addr string, req *http.Request) (connOut net.Conn, err error) {
	d := func(network, addr string) (net.Conn, error) {
		return client.getBalancer().DialQOS("tcp", addr, client.targetQOS(req))
	}

	if runtime.GOOS == "android" || client.ProxyAll {
		connOut, err = d("tcp", addr)
	} else {
		connOut, err = detour.Dialer(d)("tcp", addr)
	}
	return
}

// respondOK sends a 200 HTTP response to the client
func respondOK(writer io.Writer, req *http.Request) error {
	defer func() {
		if err := req.Body.Close(); err != nil {
			log.Debugf("Error closing body of OK response: %s", err)
		}
	}()

	resp := &http.Response{
		StatusCode: http.StatusOK,
		ProtoMajor: 1,
		ProtoMinor: 1,
	}

	return resp.Write(writer)
}

// respondBadGateway sends a 502 HTTP response to the client
func respondBadGateway(w io.Writer, msg string) {
	log.Debugf("Responding BadGateway: %v", msg)
	resp := &http.Response{
		StatusCode: http.StatusBadGateway,
		ProtoMajor: 1,
		ProtoMinor: 1,
	}
	err := resp.Write(w)
	if err == nil {
		if _, err = w.Write([]byte(msg)); err != nil {
			log.Debugf("Error writing error to io.Writer: %s", err)
		}
	}
}

// hostIncludingPort extracts the host:port from a request.  It fills in a
// a default port if none was found in the request.
func hostIncludingPort(req *http.Request, defaultPort int) string {
	_, port, err := net.SplitHostPort(req.Host)
	if port == "" || err != nil {
		return req.Host + ":" + strconv.Itoa(defaultPort)
	} else {
		return req.Host
	}
}
