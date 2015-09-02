// package pubsub provides a global publish and subscribe infrastructure
// for lantern
package pubsub

import (
	"strconv"

	"github.com/asaskevich/EventBus"
)

var (
	bus = EventBus.New()
)

// The constant topics to publish and subscribe to. All topics should
// be defined here directly.
const (
	IP = iota
	// Someothertopic = iota
)

// Pub publishes the given interface to any listeners for that interface.
func Pub(topic int, data interface{}) {
	bus.Publish(strconv.Itoa(topic), data)
}

// Sub subscribes to specific interfaces with the specified callback
// function.
func Sub(topic int, fn interface{}) error {
	return bus.SubscribeAsync(strconv.Itoa(topic), fn, true)
}

// SubOnce subscribes to a topic a single time and removes the specified
// handler after executing once
func SubOnce(topic int, fn interface{}) error {
	return bus.SubscribeOnceAsync(strconv.Itoa(topic), fn)
}
