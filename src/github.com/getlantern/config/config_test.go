package config

import (
	"runtime"
	"testing"

	"github.com/getlantern/testify/assert"
)

func TestPubSub(t *testing.T) {
	var count int
	Sub("client.uiaddr", func(key string, value interface{}, source string, incr int) {
		count = incr
		if assert.Equal(t, "client.uiaddr", key) {
			assert.Equal(t, "localhost:16823", value, "value should match")
			assert.Equal(t, "local.yaml", source, "source should match")
		}
	})
	Pub("client.uiaddr", "localhost:16823", "local.yaml")
	runtime.Gosched()
	assert.Equal(t, 1, count, "Should subscribe to changes")
	Pub("client.uiaddr", "localhost:16823", "local.yaml")
	runtime.Gosched()
	assert.Equal(t, 2, count, "Should subscribe to changes")
}

func TestPrecedence(t *testing.T) {
	var count int
	SetPrecedence("high-prec", 1)
	Sub("value", func(key string, value interface{}, source string, incr int) {
		count = incr
		assert.Equal(t, 123, value, "should not receive changes from lower precedence publisher")
		assert.Equal(t, "high-prec", source, "should not receive changes from lower precedence publisher")
	})
	Pub("value", 123, "high-prec")
	runtime.Gosched()
	Pub("value", 456, "normal-prec")
	runtime.Gosched()
	assert.Equal(t, 1, count, "Should subscribe to changes")
}
