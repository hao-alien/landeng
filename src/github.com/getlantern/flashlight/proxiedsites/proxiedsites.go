package proxiedsites

import (
	"github.com/getlantern/detour"
	"github.com/getlantern/proxiedsites"
)

func Configure(cfg *proxiedsites.Config) {
	delta := proxiedsites.Configure(cfg)
	if delta != nil {
		updateDetour(delta)
	}
}

func updateDetour(delta *proxiedsites.Delta) {
	// TODO: subscribe changes of geolookup and set country accordingly
	// safe to hardcode here as IR has all detection rules
	detour.SetCountry("IR")

	// for simplicity, detour matches whitelist using host:port string
	// so we add ports to each proxiedsites
	for _, v := range delta.Deletions {
		detour.RemoveFromWl(v + ":80")
		detour.RemoveFromWl(v + ":443")
	}
	for _, v := range delta.Additions {
		detour.AddToWl(v+":80", true)
		detour.AddToWl(v+":443", true)
	}
}
