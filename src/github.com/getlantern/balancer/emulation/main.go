package main

import (
	"io/ioutil"
	"net"
	"net/http"
	"os"
	"os/signal"
	"sync"
	"syscall"

	"github.com/tylertreat/comcast/throttler"

	"github.com/getlantern/balancer"
	"github.com/getlantern/flashlight/client"
	"github.com/getlantern/golog"
	"github.com/getlantern/yaml"
)

var log = golog.LoggerFor("benchmark")

type entry struct {
	Latency        int
	Bandwidth      int
	PacketLossRate int
	Server         client.ChainedServerInfo
}

func main() {
	ch := handleSignals()
	servers := []entry{}
	bytes, err := ioutil.ReadFile("./test.yaml")
	if err != nil {
		log.Fatal(err)
	}
	err = yaml.Unmarshal(bytes, &servers)
	if err != nil {
		log.Fatal(err)
	}

	for _, s := range servers {
		ip, port, err := net.SplitHostPort(s.Server.Addr)
		if err != nil {
			log.Fatal(err)
		}
		config := &throttler.Config{
			Device:           "eth0",
			Latency:          s.Latency,
			DefaultBandwidth: s.Bandwidth,
			PacketLoss:       float64(s.PacketLossRate) / 100.0,
			TargetIps:        []string{ip},
			TargetPorts:      []string{port},
		}
		throttler.Run(config)

		defer func() {
			config.Stop = true
			throttler.Run(config) // to teardown
		}()

	}
	dialers := []*balancer.Dialer{}
	for _, s := range servers {
		d, err := s.Server.Dialer("fake-device-id")
		if err != nil {
			log.Fatal(err)
		}
		dialers = append(dialers, d)
	}
	bal := balancer.New(balancer.QualityFirst, dialers...)

	//start := time.Now().Format("20060102T15:04:05")
	var wg sync.WaitGroup
	for i := 0; i < 10; i++ {
		wg.Add(1)
		go func(i int) {
			defer wg.Done()
			client := &http.Client{
				Transport: &http.Transport{
					DisableKeepAlives: true,
					Dial:              bal.Dial,
				},
			}
			for {
				req, err := http.NewRequest("GET", "www.baidu.com/robots.txt", nil)
				if err != nil {
					log.Errorf("Could not create HTTP request?")
					return
				}
				resp, err := client.Do(req)
				if err != nil {
					log.Errorf("Could not execute HTTP request?")
					return
				}
				resp.Body.Close()
				select {
				case <-ch:
					log.Debugf("Stopped benchmarker %d", i)
					return
				default:
				}
			}
		}(i)
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
