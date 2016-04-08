[libp2p](https://github.com/ipfs/specs/tree/master/libp2p) implementation in Go.
===================

[![](https://img.shields.io/badge/made%20by-Protocol%20Labs-blue.svg?style=flat-square)](http://ipn.io)
[![](https://img.shields.io/badge/freenode-%23ipfs-blue.svg?style=flat-square)](http://webchat.freenode.net/?channels=%23ipfs)
[![GoDoc](https://godoc.org/github.com/ipfs/go-libp2p?status.svg)](https://godoc.org/github.com/ipfs/go-libp2p)
[![Build Status](https://travis-ci.org/ipfs/go-libp2p.svg?branch=master)](https://travis-ci.org/ipfs/go-libp2p)

![](https://raw.githubusercontent.com/diasdavid/specs/libp2p-spec/protocol/network/figs/logo.png)

> libp2p implementation in Go

# Description

[libp2p](https://github.com/ipfs/specs/tree/master/libp2p) is a networking stack and library modularized out of [The IPFS Project](https://github.com/ipfs/ipfs), and bundled separately for other tools to use.
>
libp2p is the product of a long, and arduous quest of understanding -- a deep dive into the internet's network stack, and plentiful peer-to-peer protocols from the past. Building large scale peer-to-peer systems has been complex and difficult in the last 15 years, and libp2p is a way to fix that. It is a "network stack" -- a protocol suite -- that cleanly separates concerns, and enables sophisticated applications to only use the protocols they absolutely need, without giving up interoperability and upgradeability. libp2p grew out of IPFS, but it is built so that lots of people can use it, for lots of different projects.
>
> We will be writing a set of docs, posts, tutorials, and talks to explain what p2p is, why it is tremendously useful, and how it can help your existing and new projects. But in the meantime, check out
>
> - [**The IPFS Network Spec**](https://github.com/ipfs/specs/tree/master/libp2p), which grew into libp2p
> - [**go-libp2p implementation**](https://github.com/ipfs/go-libp2p)
> - [**js-libp2p implementation**](https://github.com/diasdavid/js-libp2p)

# Contribute

libp2p implementation in Go is a work in progress. As such, there's a few things you can do right now to help out:
 - Go through the modules below and **check out existing issues**. This would be especially useful for modules in active development. Some knowledge of IPFS/libp2p may be required, as well as the infrasture behind it - for instance, you may need to read up on p2p and more complex operations like muxing to be able to help technically.
 - **Perform code reviews**. 
 - **Add tests**. There can never be enough tests.

# Usage

`go-libp2p` repo will be a place holder for the list of Go modules that compose Go libp2p, as well as its entry point.

## Install

```bash
$ go get -d github.com/ipfs/go-libp2p
$ cd $GOPATH/src/github.com/ipfs/go-libp2p
$ make
```

# Run tests

```bash
$ cd $GOPATH/src/github.com/ipfs/go-libp2p
$ make deps
$ go test ./p2p/<path of module you want to run tests for>
```


## Links
- [**Specs**](https://github.com/ipfs/specs/tree/master/libp2p)
- [**Website**](https://github.com/diasdavid/libp2p-website)
