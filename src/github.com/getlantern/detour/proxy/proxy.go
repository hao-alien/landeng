// package main provides a simple proxy program that uses detour, useful for
// performance testing.
package main

import (
	nlog "log"
	"math/rand"
	"net"
	"net/http"
	"net/http/httputil"
	_ "net/http/pprof"
	"os"
	"strconv"
	"sync/atomic"
	"time"

	"github.com/getlantern/detour"
	"github.com/getlantern/golog"
)

const (
	counterHeader = "X-Detour-Counter"
)

var (
	log = golog.LoggerFor("detour.proxy")

	letterRunes = []rune("abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ")
	data        []byte
)

func init() {
	rand.Seed(time.Now().UnixNano())

	data = []byte(randStringRunes(32276))
	data[len(data)-1] = '\n'
}

// randStringRunes generates a random string of the given length.
// Taken from http://stackoverflow.com/questions/22892120/how-to-generate-a-random-string-of-a-fixed-length-in-golang.
func randStringRunes(n int) string {
	b := make([]rune, n)
	for i := range b {
		b[i] = letterRunes[rand.Intn(len(letterRunes))]
	}
	return string(b)
}

type mockHandler struct {
	writer func(w http.ResponseWriter)
}

func (m *mockHandler) ServeHTTP(w http.ResponseWriter, r *http.Request) {
	var msg = r.Header.Get(counterHeader) + "\n"
	log.Debug("***Server got " + msg)
	w.Header()["Content-Length"] = []string{strconv.Itoa(len(data))}
	_, _ = w.Write(data)
	w.(http.Flusher).Flush()
}

func main() {
	go func() {
		log.Debug("Starting pprof at localhost:8083/debug/pprof")
		log.Fatal(http.ListenAndServe("localhost:8083", nil))
	}()
	go func() {
		log.Debug("Starting simple server at localhost:8082")
		m := mockHandler{}
		log.Fatal(http.ListenAndServe("localhost:8082", &m))
	}()
	go func() {
		log.Debug("Starting standard proxy at localhost:8081")
		log.Fatal(http.ListenAndServe("localhost:8081", &httputil.ReverseProxy{
			Director: func(req *http.Request) {},
			ErrorLog: log.AsStdLogger(),
		}))
	}()
	log.Debug("Starting detour proxy at localhost:8080")
	log.Debug("Try `boom -disable-keepalive -n 100 -x http://127.0.0.1:8080 http://127.0.0.1:8082/`")
	var counter uint64
	log.Fatal(http.ListenAndServe("localhost:8080", &httputil.ReverseProxy{
		Director: func(req *http.Request) {
			c := strconv.FormatUint(atomic.AddUint64(&counter, 1), 10)
			req.Header.Set(counterHeader, c)
			log.Debug("***Reverse proxy send " + c)
		},
		Transport: &http.Transport{
			// This just detours to net.Dial, meaning that it doesn't accomplish any
			// unblocking, it's just here for performance testing.
			Dial: detour.Dialer(true, func(network, addr string) (net.Conn, error) {
				// Always dial to our server, no matter what was requested (simulates
				// blocking)
				return net.Dial("tcp", "127.0.0.1:8082")
			}),
		},
		ErrorLog: nlog.New(os.Stderr, "proxy", 0),
	}))
}
