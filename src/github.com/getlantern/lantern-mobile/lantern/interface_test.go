package lantern

import (
	"errors"
	"fmt"
	"io/ioutil"
	"net"
	"net/http"
	"net/url"
	"testing"
	"time"

	"github.com/getlantern/testify/assert"
)

const expectedBody = "Google is built by a large team of engineers, designers, researchers, robots, and others in many different sites across the globe. It is updated continuously, and built with more tools and technologies than we can shake a stick at. If you'd like to help us out, see google.com/careers.\n"

func TestOnOff(t *testing.T) {
	err := On("TestApp", "", "", "")
	if assert.NoError(t, err, "On should have succeeded") {
		err := testProxying()
		if assert.NoError(t, err, "Proxied request after On should have worked") {
			err := Off()
			if assert.NoError(t, err, "Off should have succeeded") {
				err := testProxying()
				assert.Error(t, err, "Proxied request after Off should have failed")
			}
		}
	}
}

func testProxying() error {
	var req *http.Request

	req = &http.Request{
		Method: "GET",
		URL: &url.URL{
			Scheme: "http",
			Host:   "www.google.com",
			Path:   "http://www.google.com/humans.txt",
		},
		ProtoMajor: 1,
		ProtoMinor: 1,
		Header: http.Header{
			"Host": {"www.google.com:80"},
		},
	}

	client := &http.Client{
		Timeout: time.Second * 5,
		Transport: &http.Transport{
			Dial: func(n, a string) (net.Conn, error) {
				return net.Dial("tcp", httpProxyAddr)
			},
		},
	}

	var res *http.Response
	var err error

	if res, err = client.Do(req); err != nil {
		return err
	}

	var buf []byte

	buf, err = ioutil.ReadAll(res.Body)

	fmt.Printf(string(buf))

	if string(buf) != expectedBody {
		return errors.New("Expecting another response.")
	}

	return nil
}
