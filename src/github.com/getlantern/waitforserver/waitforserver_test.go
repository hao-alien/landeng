package waitforserver

import (
	"net"
	"testing"
	"time"

	"github.com/getlantern/testify/assert"
)

func TestSuccessUp(t *testing.T) {
	l, err := net.Listen("tcp", "localhost:0")
	if err != nil {
		t.Fatalf("Unable to listen: %s", err)
	}
	defer func() {
		if err := l.Close(); err != nil {
			t.Fatalf("Unable to close listener: %v", err)
		}
	}()
	err = WaitForServerUp("tcp", l.Addr().String(), 100*time.Millisecond)
	assert.NoError(t, err, "Server should have been found")
}

func TestFailureUp(t *testing.T) {
	err := WaitForServerUp("tcp", "localhost:18900", 100*time.Millisecond)
	assert.Error(t, err, "Server should not have been found")
}

func TestSuccessDown(t *testing.T) {
	err := WaitForServerDown("tcp", "localhost:18900", 100*time.Millisecond, 10*time.Millisecond)
	assert.NoError(t, err, "Server should be down")
}

func TestFailureDown(t *testing.T) {
	l, err := net.Listen("tcp", "localhost:0")
	if err != nil {
		t.Fatalf("Unable to listen: %s", err)
	}
	defer func() {
		if err := l.Close(); err != nil {
			t.Fatalf("Unable to close listener: %v", err)
		}
	}()
	err = WaitForServerDown("tcp", l.Addr().String(), 100*time.Millisecond, 10*time.Millisecond)
	assert.Error(t, err, "Server should not be found down")
}
