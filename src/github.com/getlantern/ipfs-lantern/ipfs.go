package ipfs

import (
	"bytes"
	"fmt"
	"io"
	"net/http"

	logging "gx/ipfs/Qmazh5oNUVsDZTs2g59rq8aYQqwpss8tcUWQzor5sCCEuH/go-log"

	"github.com/ipfs/go-ipfs/blocks/key"
	"github.com/ipfs/go-ipfs/core"
	"github.com/ipfs/go-ipfs/path"
	"github.com/ipfs/go-ipfs/repo/fsrepo"
	uio "github.com/ipfs/go-ipfs/unixfs/io"

	"golang.org/x/net/context"
)

type IPFSService struct {
	node *core.IpfsNode
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
			node: nd,
		},
		nil
}

func (srv *IPFSService) resolve(ctx context.Context, name string) (string, error) {
	p, err := srv.node.Namesys.ResolveN(ctx, name, 1)
	if err != nil {
		return "", err
	}

	return p.String(), nil
}

func (srv *IPFSService) get(ctx context.Context, pt string) (string, error) {
	p := path.Path(pt)
	dn, err := core.Resolve(ctx, srv.node, p)
	if err != nil {
		return "", err
	}

	reader, err := uio.NewDagReader(ctx, dn, srv.node.DAG)
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

func (node *IPFSService) put(ctx context.Context, p string) (string, error) {
	ref := path.Path(p)
	k := node.node.PrivateKey

	err := node.node.Namesys.Publish(ctx, k, ref)
	if err != nil {
		return "", err
	}

	hash, err := k.GetPublic().Hash()
	if err != nil {
		return "", err
	}

	return key.Key(hash).String(), nil
}

func (srv *IPFSService) getRef(w http.ResponseWriter, r *http.Request) {
	ref := r.URL.Query().Get("ref")
	if ref == "" {
		http.Error(w, "No ref provided", http.StatusInternalServerError)
		return
	}

	ctx, cancel := context.WithCancel(context.Background())
	defer cancel()

	realPath, err := srv.resolve(ctx, ref)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	s, err := srv.get(ctx, realPath)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.Write([]byte(s))
}

func (srv *IPFSService) storeData(w http.ResponseWriter, r *http.Request) {
	data := r.FormValue("data")
	if data == "" {
		http.Error(w, "No data provided", http.StatusInternalServerError)
		return
	}

	ctx, cancel := context.WithCancel(context.Background())
	defer cancel()

	ref, err := srv.put(ctx, data)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.Write([]byte(ref))
}

func (srv *IPFSService) ServeHTTP() error {
	http.HandleFunc("/get", srv.getRef)
	http.HandleFunc("/put", srv.storeData)

	return http.ListenAndServe(":8799", nil)
}
