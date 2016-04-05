package multistream

import (
	"testing"

	test "gx/ipfs/QmWSJzRkCMJFHYUQZxKwPX8WA7XipaPtfiwMPARP51ymfn/go-stream-muxer/test"
)

func TestMultiStreamTransport(t *testing.T) {
	test.SubtestAll(t, NewTransport())
}
