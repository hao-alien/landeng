package metrics

import (
	peer "gx/ipfs/QmZMehXD2w81qeVJP6r1mmocxwsD7kqAvuzGm2QWDw1H88/go-libp2p/p2p/peer"
	protocol "gx/ipfs/QmZMehXD2w81qeVJP6r1mmocxwsD7kqAvuzGm2QWDw1H88/go-libp2p/p2p/protocol"
)

type StreamMeterCallback func(int64, protocol.ID, peer.ID)
type MeterCallback func(int64)

type Reporter interface {
	LogSentMessage(int64)
	LogRecvMessage(int64)
	LogSentMessageStream(int64, protocol.ID, peer.ID)
	LogRecvMessageStream(int64, protocol.ID, peer.ID)
	GetBandwidthForPeer(peer.ID) Stats
	GetBandwidthForProtocol(protocol.ID) Stats
	GetBandwidthTotals() Stats
}
