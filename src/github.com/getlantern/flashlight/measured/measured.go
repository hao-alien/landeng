package measured

import (
	"net/http"

	"github.com/getlantern/golog"
	"github.com/getlantern/measured"
	"github.com/getlantern/measured/reporter"

	"github.com/getlantern/flashlight/pubsub"
)

const ()

var (
	log = golog.LoggerFor("flashlight.measured")
)

type Config struct {
	InfluxURL      string
	InfluxUsername string
	InfluxPassword string
}

// Start runs a goroutine that periodically coalesces the collected statistics
// and reports them to statshub via HTTPS post
func Configure(cfg *Config, httpClient *http.Client) {
	measured.Stop()
	measured.Reset()
	measured.AddReporter(reporter.NewInfluxDBReporter(cfg.InfluxURL,
		cfg.InfluxUsername,
		cfg.InfluxPassword,
		"lantern",
		httpClient))
	pubsub.Sub(pubsub.Country, func(country string) {
		if country == "" {
			country = "xx"
		}
		measured.SetDefaults(map[string]string{
			"country": country,
		})
	})
	measured.Start()
}
