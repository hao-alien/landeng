// +build !tun

package client

import (
	"bytes"
	"fmt"
	"io/ioutil"
	"net"
	"net/http"
	"net/url"
	"sync"
	"testing"
	"time"
)

const clientListenProxyAddr = "127.0.0.1:9997"

var testURLs = map[string][]byte{
	"http://www.google.com/humans.txt":  []byte("Google is built by a large team of engineers, designers, researchers, robots, and others in many different sites across the globe. It is updated continuously, and built with more tools and technologies than we can shake a stick at. If you'd like to help us out, see google.com/careers.\n"),
	"https://www.google.com/humans.txt": []byte("Google is built by a large team of engineers, designers, researchers, robots, and others in many different sites across the globe. It is updated continuously, and built with more tools and technologies than we can shake a stick at. If you'd like to help us out, see google.com/careers.\n"),
}

// Attempt to create a server in a goroutine and stop it from other place.
func TestListenAndServeStop(t *testing.T) {

	// Creating a client.
	c, err := newClient(clientListenProxyAddr, "FireTweetTest", nil, "")
	if err != nil {
		t.Fatal(err)
	}

	// Allow it some seconds to start.
	time.Sleep(time.Second * 3)

	// Attempt to stop server.
	c.Client.Stop()
}

func TestListenAndServeAgain(t *testing.T) {
	// Since we've closed out server, we should be able to launch another at the
	// same address.
	_, err := newClient(clientListenProxyAddr, "FireTweetTest", nil, "")
	if err != nil {
		t.Fatal(err)
	}

	// Allow it some seconds to start.
	time.Sleep(time.Millisecond * 100)
}

func TestListenAndServeProxy(t *testing.T) {
	var wg sync.WaitGroup

	// Testing the client we've just opened.
	for uri, expectedContent := range testURLs {
		wg.Add(1)

		go func(wg *sync.WaitGroup, uri string, expectedContent []byte) {
			if err := testClientReverseProxy(uri, expectedContent); err != nil {
				t.Fatal(err)
			}
			wg.Done()
		}(&wg, uri, expectedContent)

	}

	wg.Wait()
}

func testClientReverseProxy(destURL string, expectedContent []byte) (err error) {
	var req *http.Request

	if req, err = http.NewRequest("GET", destURL, nil); err != nil {
		return err
	}

	client := &http.Client{
		Transport: &http.Transport{
			Proxy: func(req *http.Request) (*url.URL, error) {
				return url.Parse(clientListenProxyAddr)
			},
			Dial: func(n, a string) (net.Conn, error) {
				return net.Dial("tcp", clientListenProxyAddr)
			},
		},
	}

	var res *http.Response

	if res, err = client.Do(req); err != nil {
		return err
	}

	var buf []byte

	buf, err = ioutil.ReadAll(res.Body)

	fmt.Printf("Read: %v", string(buf))

	if bytes.Equal(buf, expectedContent) == false {
		return fmt.Errorf("The response we've got from %s differs from what we expected.", destURL)
	}

	return nil
}

func TestTransparentRequestPassingThroughTun0(t *testing.T) {
	var wg sync.WaitGroup

	// Testing the client we've just opened.
	for uri, expectedContent := range testURLs {
		wg.Add(1)

		go func(wg *sync.WaitGroup, uri string, expectedContent []byte) {
			if err := testTransparentRequest(uri, expectedContent); err != nil {
				t.Fatal(err)
			}
			wg.Done()
		}(&wg, uri, expectedContent)

	}

	wg.Wait()
}

func testTransparentRequest(destURL string, expectedContent []byte) (err error) {
	var req *http.Request

	if req, err = http.NewRequest("GET", destURL, nil); err != nil {
		return err
	}

	client := &http.Client{}

	var res *http.Response

	if res, err = client.Do(req); err != nil {
		return err
	}

	var buf []byte

	buf, err = ioutil.ReadAll(res.Body)

	fmt.Printf("Read: %v", string(buf))

	if bytes.Equal(buf, expectedContent) == false {
		return fmt.Errorf("The response we've got from %s differs from what we expected.", destURL)
	}

	return nil
}
