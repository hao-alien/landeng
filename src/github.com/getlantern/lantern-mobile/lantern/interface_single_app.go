// +build !tun
package client

import (
	"github.com/getlantern/flashlight/lantern"
	"github.com/getlantern/flashlight/settings"
)

var (
	bootstrapSettings *settings.Settings

	settingsDir string

	version      string
	revisionDate string
)

// GoCallback is the supertype of callbacks passed to Go
type GoCallback interface {
	AfterStart(string)
}

var androidProps map[string]string

func LogProperties(device, model, version string) {
	androidProps = map[string]string{
		"androidDevice":     device,
		"androidModel":      model,
		"androidSdkVersion": version,
	}
}

// RunClientProxy creates a new client at the given address.
func RunClientProxy(listenAddr, appName string, ready GoCallback) error {
	go func() {
		var err error

		defaultClient, err = newClient(bootstrapSettings.HttpAddr, appName, androidProps, settingsDir)
		if err != nil {
			log.Fatalf("Could not start Lantern")
		}

		ready.AfterStart(version)
	}()
	return nil
}

// StopClientProxy stops the proxy.
func StopClientProxy() error {
	go lantern.Exit(nil)
	return nil
}
