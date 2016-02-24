// package main provides a simple proxy program that uses detour, useful for
// performance testing.
package main

import (
	"log"
	"net"
	"net/http"
	"net/http/httputil"
	_ "net/http/pprof"
	"strconv"
	"sync/atomic"

	"github.com/getlantern/detour"
)

const (
	counterHeader = "X-Detour-Counter"
)

type mockHandler struct {
	writer func(w http.ResponseWriter)
}

func (m *mockHandler) ServeHTTP(w http.ResponseWriter, r *http.Request) {
	var msg = r.Header.Get(counterHeader)
	log.Println("***Server got " + msg)
	w.Header()["Content-Length"] = []string{strconv.Itoa(len(msg))}
	_, _ = w.Write([]byte(msg))
	w.(http.Flusher).Flush()
}

func main() {
	go func() {
		log.Println("Starting pprof at localhost:8083/debug/pprof")
		log.Fatal(http.ListenAndServe("localhost:8083", nil))
	}()
	go func() {
		log.Println("Starting simple server at localhost:8082")
		m := mockHandler{}
		log.Fatal(http.ListenAndServe("localhost:8082", &m))
	}()
	go func() {
		log.Println("Starting standard proxy at localhost:8081")
		log.Fatal(http.ListenAndServe("localhost:8081", &httputil.ReverseProxy{
			Director: func(req *http.Request) {},
		}))
	}()
	log.Println("Starting detour proxy at localhost:8080")
	log.Println("Try `boom -disable-keepalive -n 100 -x http://127.0.0.1:8080 http://127.0.0.1:8082/`")
	var counter uint64
	log.Fatal(http.ListenAndServe("localhost:8080", &httputil.ReverseProxy{
		Director: func(req *http.Request) {
			c := strconv.FormatUint(atomic.AddUint64(&counter, 1), 10)
			req.Header.Set(counterHeader, c)
			log.Println("***Reverse proxy send " + c)
		},
		Transport: &http.Transport{
			// This just detours to net.Dial, meaning that it doesn't accomplish any
			// unblocking, it's just here for performance testing.
			Dial: detour.Dialer(net.Dial),
		},
	}))
}
