package detour

import (
	"io"
	"net"
	"sync/atomic"
)

type detourConn struct {
	net.Conn
	addr string
	// 1 == true, 0 == false, atomic
	errorEncountered uint32
}

func dialDetour(network string, addr string, dialer dialFunc) (conn, error) {
	log.Tracef("Dialing detour connection to %s", addr)
	conn, err := dialer(network, addr)
	if err != nil {
		log.Errorf("Dial detour to %s failed: %s", addr, err)
		return nil, err
	}
	log.Tracef("Dial detour to %s succeeded", addr)
	return &detourConn{Conn: &readBytesCounted{conn, 0}, addr: addr}, nil
}

func (dc *detourConn) Type() connType {
	return connTypeDetour
}

func (dc *detourConn) Read(b []byte, isFirst bool) (int, error) {
	n, err := dc.Conn.Read(b)
	if err != nil && err != io.EOF {
		atomic.AddUint32(&dc.errorEncountered, 1)
	}
	return n, err
}

func (dc *detourConn) Close() (err error) {
	err = dc.Conn.Close()
	if dc.Conn.(*readBytesCounted).anyDataReceived() && atomic.LoadUint32(&dc.errorEncountered) == 0 {
		log.Tracef("no error found till closing, add %s to whitelist", dc.addr)
		AddToWl(dc.addr, false)
	}
	return
}
