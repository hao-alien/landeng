package muxtest

import (
	multiplex "gx/ipfs/QmWSJzRkCMJFHYUQZxKwPX8WA7XipaPtfiwMPARP51ymfn/go-stream-muxer/multiplex"
	multistream "gx/ipfs/QmWSJzRkCMJFHYUQZxKwPX8WA7XipaPtfiwMPARP51ymfn/go-stream-muxer/multistream"
	muxado "gx/ipfs/QmWSJzRkCMJFHYUQZxKwPX8WA7XipaPtfiwMPARP51ymfn/go-stream-muxer/muxado"
	spdy "gx/ipfs/QmWSJzRkCMJFHYUQZxKwPX8WA7XipaPtfiwMPARP51ymfn/go-stream-muxer/spdystream"
	yamux "gx/ipfs/QmWSJzRkCMJFHYUQZxKwPX8WA7XipaPtfiwMPARP51ymfn/go-stream-muxer/yamux"
)

var _ = multiplex.DefaultTransport
var _ = multistream.NewTransport
var _ = muxado.Transport
var _ = spdy.Transport
var _ = yamux.DefaultTransport
