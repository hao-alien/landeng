// Package lantern provides an interface for embedding Lantern inside of android
// applications.
package lantern

import (
	"fmt"
	"os/user"
	"path/filepath"
	"time"

	"github.com/getlantern/appdir"
	"github.com/getlantern/flashlight/config"
	"github.com/getlantern/flashlight/lantern"
	"github.com/getlantern/flashlight/logging"
	"github.com/getlantern/flashlight/settings"
	"github.com/getlantern/golog"
	"github.com/getlantern/waitforserver"
)

var (
	log = golog.LoggerFor("lantern-android.client")
)

const (
	// Right now, the httpAddr is always localhost:8787. It defaults to this, and
	// it looks like it gets set to this from the cloud configuration too, so
	// there's no way of overriding this.
	httpProxyAddr = "localhost:8787"
)

// AndroidInfo contains information about the current Android app
type AndroidInfo struct {
	AppName    string
	Model      string
	Device     string
	SdkVersion string
}

// On turns Lantern on. On does not return until something is listening on port
// 8787 or 30 seconds have elapsed.
//
// appInfo - information about the app embedding lantern.  AppName is required,
// other stuff is optional.
func On(appName string,
	model string,
	device string,
	sdkVersion string) error {
	err := configure(appName, model, device, sdkVersion)
	if err != nil {
		return nil
	}

	return startIfNecessary()
}

func configure(appName string,
	model string,
	device string,
	sdkVersion string) error {
	if appName == "" {
		return fmt.Errorf("Please specify an appName")
	}
	usr, err := user.Current()
	if err != nil {
		return fmt.Errorf("Unable to determine user's home directory: %v", err)
	}
	settingsDir := filepath.Join(usr.HomeDir, ".lantern-embedded", appName)
	log.Debugf("settings directory is %s", settingsDir)

	appdir.AndroidDir = settingsDir
	settings.SetAndroidPath(settingsDir)

	logging.ConfigureAndroid(map[string]string{
		"androidDevice":     device,
		"androidModel":      model,
		"androidSdkVersion": sdkVersion,
	})

	return nil
}

func startIfNecessary() error {
	// Check if something is already listening on 8787
	err := waitforserver.WaitForServer("tcp", httpProxyAddr, 10*time.Millisecond)
	if err == nil {
		log.Debug("Something already listening at localhost:8787, assuming it's Lantern")
		return nil
	}

	_, err = lantern.Start(false, true, false, true, func(cfg *config.Config) {})
	if err != nil {
		log.Fatalf("Could not start Lantern: %v", err)
	}

	return waitforserver.WaitForServer("tcp", httpProxyAddr, 30*time.Second)
}

// Off turns Lantern off. Off does not return until nothing is listening on port
// 8787 or 30 seconds have elapsed.
func Off() error {
	go lantern.Exit(nil)
	return waitforserver.WaitForServerDown("tcp", httpProxyAddr, 30*time.Second, 25*time.Millisecond)
}
