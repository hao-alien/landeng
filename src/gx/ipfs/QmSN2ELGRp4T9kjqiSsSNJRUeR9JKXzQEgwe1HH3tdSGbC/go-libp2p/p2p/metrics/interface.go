package metrics

import (
	peer "gx/ipfs/QmSN2ELGRp4T9kjqiSsSNJRUeR9JKXzQEgwe1HH3tdSGbC/go-libp2p/p2p/peer"
	protocol "gx/ipfs/QmSN2ELGRp4T9kjqiSsSNJRUeR9JKXzQEgwe1HH3tdSGbC/go-libp2p/p2p/protocol"
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
