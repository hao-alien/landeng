package main

import (
	"fmt"
	"os"

	"github.com/getlantern/ipfs-lantern"
	"github.com/mitchellh/go-homedir"
)

func main() {
	if len(os.Args) < 2 {
		fmt.Println("Please give a peer ID as an argument")
		return
	}

	homedir, err := homedir.Dir()
	if err != nil {
		fmt.Println("Could not initialize IPFS: ", err)
		return
	}

	err = ipfs.Run(os.Args[1], homedir+"/.ipfs")
	if err != nil {
		fmt.Println(err)
	}
}
