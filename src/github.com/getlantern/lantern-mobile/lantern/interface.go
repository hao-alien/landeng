package client

import (
	"github.com/getlantern/appdir"
	"github.com/getlantern/flashlight/lantern"
	"github.com/getlantern/flashlight/logging"
	"github.com/getlantern/flashlight/settings"
	"github.com/getlantern/golog"
	"github.com/getlantern/lantern-mobile/lantern/interceptor"
	"github.com/getlantern/lantern-mobile/lantern/protected"
	proclient "github.com/getlantern/pro-server-client/go-client"
)

var (
	log         = golog.LoggerFor("lantern-android.client")
	i           *interceptor.Interceptor
	appSettings *settings.Settings

	proClient = proclient.NewClient()

	trackingCodes = map[string]string{
		"FireTweet": "UA-21408036-4",
		"Lantern":   "UA-21815217-14",
	}
)

type Provider interface {
	Model() string
	Device() string
	Version() string
	AppName() string
	VpnMode() bool
	GetDnsServer() string
	SettingsDir() string
	AfterStart(string)
	Protect(fileDescriptor int) error
	Notice(message string, fatal bool)
}

func Configure(provider Provider) error {

	log.Debugf("Configuring Lantern version: %s", lantern.GetVersion())

	settingsDir := provider.SettingsDir()
	log.Debugf("settings directory is %s", settingsDir)

	appdir.AndroidDir = settingsDir
	settings.SetAndroidPath(settingsDir)
	appSettings = settings.Load(lantern.GetVersion(), lantern.GetRevisionDate(), "")

	return nil
}

// Start creates a new client at the given address.
func Start(provider Provider) {

	log.Debugf("About to configure Lantern")
	l := lantern.New(appSettings.HttpAddr)

	if provider.VpnMode() {
		dnsServer := provider.GetDnsServer()
		protected.Configure(provider, dnsServer, true)
	}

	androidProps := map[string]string{
		"androidDevice":     provider.Device(),
		"androidModel":      provider.Model(),
		"androidSdkVersion": provider.Version(),
	}
	logging.ConfigureAndroid(androidProps)

	go func() {
		err := l.Start(false, true, false,
			true, nil)

		if err != nil {
			log.Fatalf("Could not start Lantern")
		}
	}()

	if !provider.VpnMode() {
		return
	}

	i, err := interceptor.Do(l.Client,
		appSettings.SocksAddr, appSettings.HttpAddr,
		provider.Notice)

	if err != nil {
		log.Errorf("Error starting interceptor: %v", err)
	} else {
		lantern.AddExitFunc(func() {
			if i != nil {
				i.Stop()
			}
		})
	}

	provider.AfterStart(lantern.GetVersion())
}

func ReferralCode(email string) string {
	u := proclient.User{
		Email: email,
	}
	userRes, err := proClient.UserCreate(u)
	if err != nil {
		log.Errorf("Could not create a new Pro user: %v", err)
	} else {
		u = userRes.User
		res, err := proClient.CreateCode(u)
		if err != nil {
			log.Errorf("Could not create code: %v", err)
		} else {
			log.Debugf("Referral code is %s", res.Code)
			return res.Code
		}
	}
	return ""
}

func Stop() {
	go lantern.Exit(nil)
}
