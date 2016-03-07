package main

import (
	"fmt"
	"io/ioutil"
	"os"
	"os/signal"
	"sync"
	"syscall"
	"time"

	"github.com/getlantern/balancer"
	"github.com/getlantern/flashlight/client"
	"github.com/getlantern/golog"
	"github.com/getlantern/yaml"
)

var log = golog.LoggerFor("benchmark")

func main() {
	ch := handleSignals()
	servers := []client.ChainedServerInfo{}
	bytes, err := ioutil.ReadFile("./test.yaml")
	if err != nil {
		log.Fatal(err)
	}
	err = yaml.Unmarshal(bytes, &servers)
	if err != nil {
		log.Fatal(err)
	}
	start := time.Now().Format("20060102T15:04:05")
	var wg sync.WaitGroup
	for _, s := range servers {
		wg.Add(1)
		go func(s client.ChainedServerInfo) {
			d, err := s.Dialer("fake-device-id")
			if err != nil {
				log.Fatal(err)
			}
			fname := fmt.Sprintf("./%s_%s.csv", start, s.Addr)
			bm := balancer.NewBenchmarker(d, fname)
			bm.Start(10*time.Minute, 10*time.Second)
			log.Debugf("Started benchmarker %s", s.Addr)
			<-ch
			log.Debugf("Stopping benchmarker %s", s.Addr)
			bm.Stop()
			log.Debugf("Stopped benchmarker %s", s.Addr)
			wg.Done()
		}(s)
		timer := time.NewTimer(1 * time.Minute) // avoid overlap
		select {
		case <-timer.C:
		case <-ch:
			return
		}
	}
	wg.Wait()
}

// Handle system signals for clean exit
func handleSignals() chan struct{} {
	chToReturn := make(chan struct{})
	c := make(chan os.Signal, 1)
	signal.Notify(c,
		syscall.SIGHUP,
		syscall.SIGINT,
		syscall.SIGQUIT)
	go func() {
		s := <-c
		log.Debugf("Got signal \"%s\", exiting...", s)
		close(chToReturn)
	}()
	return chToReturn
}
