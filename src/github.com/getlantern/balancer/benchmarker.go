package balancer

import (
	"fmt"
	"io"
	"io/ioutil"
	"net/http"
	"os"
	"time"
)

type datapoint struct {
	ts time.Time
	m  metrics
}

type Benchmarker struct {
	dialer
	writer        io.WriteCloser
	bytesRead     int64
	throughput    int64
	avgThroughput int64
}

func NewBenchmarker(d *Dialer, filename string) *Benchmarker {
	file, err := os.Create(filename)
	if err != nil {
		log.Fatal(err)
	}
	return &Benchmarker{dialer: dialer{Dialer: d}, writer: file}
}

func (bm *Benchmarker) Start(every time.Duration, interval time.Duration) {
	bm.start()
	go func() {
		ticker := time.NewTimer(0)
		sizes := [...]string{"small", "medium", "large"}
	out:
		for {
			select {
			case <-ticker.C:
				ticker.Reset(every)
				timer := time.NewTimer(interval)
				for _, size := range sizes {
					bm.ping(size)
					bm.dump(size)
					timer.Reset(interval)
					select {
					case <-timer.C:
					case <-bm.closeCh:
						break out
					}
				}
			case <-bm.closeCh:
				break out
			}
		}
		_ = bm.writer.Close()
	}()
}

func (bm *Benchmarker) Stop() {
	bm.stop()
}

func (bm *Benchmarker) dump(size string) {
	m := bm.metrics()
	fmt.Fprintf(bm.writer, "%s,%s,%s,%d,%d,%d,%d,%d,%d,%d\n",
		bm.Label,
		time.Now().Format("15:04:05"),
		size,
		int64(m.avgDialTime)/int64(time.Millisecond),
		m.consecSuccesses,
		m.consecFailures,
		m.errorCount,
		bm.bytesRead,
		bm.throughput,
		bm.avgThroughput)
}

func (bm *Benchmarker) ping(size string) bool {
	bm.bytesRead = 0
	bm.throughput = 0
	defer func() {
		bm.avgThroughput = (bm.avgThroughput + bm.throughput) / 2
	}()
	client := &http.Client{
		Transport: &http.Transport{
			DisableKeepAlives: true,
			Dial:              bm.checkedDial,
		},
	}
	req, err := http.NewRequest("GET", "http://it-does-not-matter.com", nil)
	if err != nil {
		log.Errorf("Could not create HTTP request?")
		return false
	}
	req.Header.Set("X-LANTERN-AUTH-TOKEN", bm.AuthToken)
	req.Header.Set("X-Lantern-Ping", size)

	start := time.Now()
	resp, err := client.Do(req)
	if err != nil {
		log.Debugf("Error ping dialer %s: %s", bm.Label, err)
		return false
	}
	n, err := io.Copy(ioutil.Discard, resp.Body)
	if err != nil {
		log.Debugf("Error read from dialer %s: %s", bm.Label, err)
	}
	duration := time.Now().Sub(start)
	bm.bytesRead = n
	bm.throughput = n * int64(time.Second) / int64(duration)
	if err := resp.Body.Close(); err != nil {
		log.Debugf("Unable to close response body: %v", err)
	}
	log.Tracef("Ping %s, status code %d", bm.Label, resp.StatusCode)
	return true
}
