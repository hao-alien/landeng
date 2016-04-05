package peerstream_multiplex

import (
	"testing"

	test "gx/ipfs/QmWSJzRkCMJFHYUQZxKwPX8WA7XipaPtfiwMPARP51ymfn/go-stream-muxer/test"
)

func TestMultiplexTransport(t *testing.T) {
	test.SubtestAll(t, DefaultTransport)
}
