package peerstream_spdystream

import (
	"testing"

	test "gx/ipfs/QmWSJzRkCMJFHYUQZxKwPX8WA7XipaPtfiwMPARP51ymfn/go-stream-muxer/test"
)

func TestSpdyStreamTransport(t *testing.T) {
	test.SubtestAll(t, Transport)
}
