package sm_yamux

import (
	"testing"

	test "gx/ipfs/QmWSJzRkCMJFHYUQZxKwPX8WA7XipaPtfiwMPARP51ymfn/go-stream-muxer/test"
)

func TestYamuxTransport(t *testing.T) {
	test.SubtestAll(t, DefaultTransport)
}
