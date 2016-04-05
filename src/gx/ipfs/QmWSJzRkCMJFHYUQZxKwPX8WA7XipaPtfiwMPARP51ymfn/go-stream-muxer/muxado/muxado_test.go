package peerstream_muxado

import (
	"testing"

	test "gx/ipfs/QmWSJzRkCMJFHYUQZxKwPX8WA7XipaPtfiwMPARP51ymfn/go-stream-muxer/test"
)

func TestMuxadoTransport(t *testing.T) {
	test.SubtestAll(t, Transport)
}
