package main

import (
	"fmt"
	"os"

	"github.com/getlantern/ipfs-lantern"
)

func main() {
	if len(os.Args) < 2 {
		fmt.Println("Please give a peer ID as an argument")
		return
	}
	ipfs.Run(os.Args[1], ".ipfs")
}
