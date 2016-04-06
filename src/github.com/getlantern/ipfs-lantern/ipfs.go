package ipfs

import (
	"bytes"
	"fmt"
	"io"

	logging "gx/ipfs/Qmazh5oNUVsDZTs2g59rq8aYQqwpss8tcUWQzor5sCCEuH/go-log"

	"github.com/ipfs/go-ipfs/core"
	"github.com/ipfs/go-ipfs/path"
	"github.com/ipfs/go-ipfs/repo/fsrepo"
	uio "github.com/ipfs/go-ipfs/unixfs/io"

	"golang.org/x/net/context"
)

func resolve(node *core.IpfsNode, ctx context.Context, name string) (string, error) {
	p, err := node.Namesys.ResolveN(ctx, name, 1)
	if err != nil {
		return "", err
	}

	return p.String(), nil
}

func get(node *core.IpfsNode, ctx context.Context, pt string) (string, error) {
	p := path.Path(pt)
	dn, err := core.Resolve(ctx, node, p)
	if err != nil {
		return "", err
	}

	reader, err := uio.NewDagReader(ctx, dn, node.DAG)
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

func Run(target string, localRepo string) error {
	logging.LevelInfo()

	r, err := fsrepo.Open(localRepo)
	if err != nil {
		return fmt.Errorf("Error opening IPFS repo: %v", err)
	}

	ctx, cancel := context.WithCancel(context.Background())
	defer cancel()

	cfg := &core.BuildCfg{
		Repo:   r,
		Online: true,
	}

	nd, err := core.NewNode(ctx, cfg)
	if err != nil {
		return fmt.Errorf("Error initializing IPFS node: %v", err)
	}

	realPath, err := resolve(nd, ctx, target)
	if err != nil {
		fmt.Printf("resolve: %s\n", err)
		return fmt.Errorf("Error resolving IPNS link: %v", err)
	}
	fmt.Printf("Real path for %s: %s\n", target, realPath)

	s, err := get(nd, ctx, realPath)
	if err != nil {
		fmt.Printf("get: %s\n", err)
		return fmt.Errorf("Error retrieving IPFS file: %v", err)
	}
	fmt.Println(s)

	return nil
}
