package testutil

import (
	"testing"

	bhost "gx/ipfs/QmZMehXD2w81qeVJP6r1mmocxwsD7kqAvuzGm2QWDw1H88/go-libp2p/p2p/host/basic"
	metrics "gx/ipfs/QmZMehXD2w81qeVJP6r1mmocxwsD7kqAvuzGm2QWDw1H88/go-libp2p/p2p/metrics"
	inet "gx/ipfs/QmZMehXD2w81qeVJP6r1mmocxwsD7kqAvuzGm2QWDw1H88/go-libp2p/p2p/net"
	swarm "gx/ipfs/QmZMehXD2w81qeVJP6r1mmocxwsD7kqAvuzGm2QWDw1H88/go-libp2p/p2p/net/swarm"
	peer "gx/ipfs/QmZMehXD2w81qeVJP6r1mmocxwsD7kqAvuzGm2QWDw1H88/go-libp2p/p2p/peer"
	tu "gx/ipfs/QmZMehXD2w81qeVJP6r1mmocxwsD7kqAvuzGm2QWDw1H88/go-libp2p/testutil"

	context "gx/ipfs/QmZy2y8t9zQH2a1b8q2ZSLKp17ATuJoCNxxyMFG5qFExpt/go-net/context"
	ma "gx/ipfs/QmcobAGsCjYt5DXoq9et9L8yR8er7o7Cu3DTvpaq12jYSz/go-multiaddr"
)

func GenSwarmNetwork(t *testing.T, ctx context.Context) *swarm.Network {
	p := tu.RandPeerNetParamsOrFatal(t)
	ps := peer.NewPeerstore()
	ps.AddPubKey(p.ID, p.PubKey)
	ps.AddPrivKey(p.ID, p.PrivKey)
	n, err := swarm.NewNetwork(ctx, []ma.Multiaddr{p.Addr}, p.ID, ps, metrics.NewBandwidthCounter())
	if err != nil {
		t.Fatal(err)
	}
	ps.AddAddrs(p.ID, n.ListenAddresses(), peer.PermanentAddrTTL)
	return n
}

func DivulgeAddresses(a, b inet.Network) {
	id := a.LocalPeer()
	addrs := a.Peerstore().Addrs(id)
	b.Peerstore().AddAddrs(id, addrs, peer.PermanentAddrTTL)
}

func GenHostSwarm(t *testing.T, ctx context.Context) *bhost.BasicHost {
	n := GenSwarmNetwork(t, ctx)
	return bhost.New(n)
}

var RandPeerID = tu.RandPeerID
