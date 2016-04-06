package ipfs

import (
	"bytes"
	"fmt"
	"io"
	"net/http"

	logging "gx/ipfs/Qmazh5oNUVsDZTs2g59rq8aYQqwpss8tcUWQzor5sCCEuH/go-log"

	"github.com/ipfs/go-ipfs/core"
	"github.com/ipfs/go-ipfs/path"
	"github.com/ipfs/go-ipfs/repo/fsrepo"
	uio "github.com/ipfs/go-ipfs/unixfs/io"

	"golang.org/x/net/context"
)

type IPFSService struct {
	node    *core.IpfsNode
	context *context.Context
}

func NewIPFSService(localRepo string) (*IPFSService, error) {
	logging.LevelInfo()

	r, err := fsrepo.Open(localRepo)
	if err != nil {
		return nil, fmt.Errorf("Error opening IPFS repo: %v", err)
	}

	ctx, cancel := context.WithCancel(context.Background())
	defer cancel()

	cfg := &core.BuildCfg{
		Repo:   r,
		Online: true,
	}

	nd, err := core.NewNode(ctx, cfg)
	if err != nil {
		return nil, fmt.Errorf("Error initializing IPFS node: %v", err)
	}

	return &IPFSService{
			node:    nd,
			context: &ctx,
		},
		nil
}

func (srv *IPFSService) resolve(name string) (string, error) {
	p, err := srv.node.Namesys.ResolveN(*srv.context, name, 1)
	if err != nil {
		return "", err
	}

	return p.String(), nil
}

func (srv *IPFSService) get(pt string) (string, error) {
	p := path.Path(pt)
	dn, err := core.Resolve(*srv.context, srv.node, p)
	if err != nil {
		return "", err
	}

	reader, err := uio.NewDagReader(*srv.context, dn, srv.node.DAG)
	if err != nil {
		return "", err
	}
	var buf bytes.Buffer
	_, err = io.Copy(&buf, reader)
	if err != nil {
		return "", err
	}
	return buf.String(), nil
}

func (srv *IPFSService) getIPNS(w http.ResponseWriter, r *http.Request) {
	ref := r.URL.Query().Get("ref")
	if ref == "" {
		return
	}

	realPath, err := srv.resolve(ref)
	if err != nil {
		fmt.Printf("resolve: %s\n", err)
		return
		//return fmt.Errorf("Error resolving IPNS link: %v", err)
	}
	fmt.Printf("Real path for %s: %s\n", ref, realPath)

	s, err := srv.get(realPath)
	if err != nil {
		fmt.Printf("get: %s\n", err)
		return
		//return fmt.Errorf("Error retrieving IPFS file: %v", err)
	}

	w.Write([]byte(s))
}

func (srv *IPFSService) ServeHTTP() error {
	http.HandleFunc("/ipns-get", srv.getIPNS)

	return http.ListenAndServe(":8799", nil)
}
