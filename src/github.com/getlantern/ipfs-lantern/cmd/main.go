package main

import (
	"fmt"

	"github.com/getlantern/ipfs-lantern"
	"github.com/mitchellh/go-homedir"
)

func main() {
	homedir, err := homedir.Dir()
	if err != nil {
		fmt.Println("Could not initialize IPFS: ", err)
		return
	}

	ipfsSrv, err := ipfs.NewIPFSService(homedir + "/.ipfs")
	if err != nil {
		fmt.Println(err)
		return
	}

	err = ipfsSrv.ServeHTTP()
	if err != nil {
		fmt.Println(err)
		return
	}
}
