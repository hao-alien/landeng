package main

import (
	"io/ioutil"
	"path/filepath"
	"strings"
	"sync"

	"github.com/getlantern/appdir"
	"github.com/getlantern/yaml"

	"github.com/getlantern/flashlight/ui"
)

// Notifier is what caller register to get notified when a settings entry changed
type Notifier func(prev, cur interface{})

// BoolNotifier is a shortcut of Notifier on bool entries
type BoolNotifier func(cur bool)

const (
	ProxyAll    id = "proxyAll"
	AutoReport  id = "autoReport"
	AutoLaunch  id = "autoLaunch"
	SystemProxy id = "systemProxy"

	// nonpersistent ones
	Version      id = "version"
	BuildDate    id = "buildDate"
	RevisionDate id = "revisionDate"

	messageType = `Settings`
)

var (
	settings *Settings
	path     = filepath.Join(appdir.General("Lantern"), "settings.yaml")
)

type id string

type entries map[id]interface{}

// Settings is a struct of all settings unique to this particular Lantern instance.
type Settings struct {
	entries   entries
	persist   map[id]bool
	notifiers map[id][]Notifier
	sync.RWMutex

	service *ui.Service
}

// LoadSettings loads the initial settings at startup, either from disk or
// using defaults.
func LoadSettings(version, revisionDate, buildDate string) *Settings {
	log.Debug("Loading settings")
	// Create default settings that may or may not be overridden from an existing file
	// on disk.
	settings = New(entries{
		AutoReport:  true,
		AutoLaunch:  true,
		ProxyAll:    false,
		SystemProxy: true,
	}, true)

	// Use settings from disk if they're available.
	if bytes, err := ioutil.ReadFile(path); err != nil {
		log.Debugf("Could not read file %v", err)
	} else if err := yaml.Unmarshal(bytes, settings.entries); err != nil {
		log.Errorf("Could not load yaml %v", err)
		// Just keep going with the original settings not from disk.
	} else {
		log.Debugf("Loaded settings from %v", path)
	}

	// always override below 3 attributes as they are not meant to be persisted across versions
	settings.entries[Version] = version
	settings.entries[BuildDate] = buildDate
	settings.entries[RevisionDate] = revisionDate

	return settings
}

func New(entries entries, persist bool) *Settings {
	settings = &Settings{
		entries:   entries,
		persist:   map[id]bool{},
		notifiers: map[id][]Notifier{},
	}
	if persist {
		for k, _ := range entries {
			settings.persist[k] = true
		}
	}
	return settings
}

type msg struct {
	Settings   map[string]interface{}
	RedirectTo string
}

// Start starts the settings service that synchronizes Lantern's configuration
// with every UI client.  All added notifiers before this point will be called
// with prev as nil, in hope to avoid extra initialization for any code depends on
// settings.
func (s *Settings) Start() (err error) {
	ui.PreferProxiedUI(s.GetBool(SystemProxy))
	helloFn := func(write func(interface{}) error) error {
		log.Debugf("Sending Lantern settings to new client")
		s.Lock()
		defer s.Unlock()
		dumped := s.dump(false, true)
		return write(&msg{Settings: dumped})
	}
	s.service, err = ui.Register(messageType, nil, helloFn)
	if err == nil {
		for k, e := range s.entries {
			for _, fn := range s.notifiers[k] {
				fn(nil, e)
			}
		}
		go settings.readLoop()

	}
	return
}

func (s *Settings) readLoop() {
	for message := range s.service.In {
		log.Debugf("Read settings message from UI: %v", message)
		msg := (message).(map[string]interface{})
		s.read(msg)
	}
}

func (s *Settings) read(msg map[string]interface{}) {
	for k, v := range msg {
		// currently all settings available in UI is bool
		if value, ok := v.(bool); ok {
			s.Set(id(k), value)
		} else {
			log.Errorf("Received non-bool value from UI: %s = %v", k, v)
		}
	}
}

// AddBoolNotifier is a shortcut for notification of bool entries.
func (s *Settings) AddBoolNotifier(id id, fn BoolNotifier) {
	s.AddNotifier(id, func(prev, cur interface{}) {
		fn(cur.(bool))
	})
}

// AddNotifier attaches the notifier to settings entry with the specific id.
// Multiple notifiers can be attached to same id.
func (s *Settings) AddNotifier(id id, fn Notifier) {
	s.Lock()
	defer s.Unlock()
	s.notifiers[id] = append(s.notifiers[id], fn)
}

// GetBool is a shortcut to get bool entry, will panic if the entry doesn't
// exist or is not a bool.
func (s *Settings) GetBool(id id) bool {
	return s.Get(id).(bool)
}

// Getid is a shortcut to get id entry, will panic if the entry doesn't
// exist or is not a id.
func (s *Settings) GetString(id id) string {
	return s.Get(id).(string)
}

// Get gets the value of single settings entry, or nil if the entry doesn't exist.
func (s *Settings) Get(id id) interface{} {
	s.RLock()
	defer s.RUnlock()
	v := s.entries[id]
	log.Tracef("Get settings entry '%s', return %+v", id, v)
	return v
}

// Set sets the value of single settings entry.
func (s *Settings) Set(id id, value interface{}) {
	s.Lock()
	defer s.Unlock()
	log.Tracef("Set settings entry '%s' to %+v", id, value)
	prev := s.entries[id]
	if prev == value {
		log.Debugf("Settings entry '%s' doesn't change from its previous value %+v", id, value)
		return
	}
	s.entries[id] = value
	for _, fn := range s.notifiers[id] {
		log.Tracef("Calling notifier on '%s' with (%+v, %+v)", id, prev, value)
		fn(prev, value)
	}
	if s.persist[id] {
		s.save()
	}
}

// Save saves settings to disk.
func (s *Settings) Save() {
	s.Lock()
	defer s.Unlock()
	s.save()
}

// save saves settings to disk without locking.
func (s *Settings) save() {
	toBeSaved := s.dump(true, false)
	log.Tracef("Saving settings:\n %+v", toBeSaved)
	if bytes, err := yaml.Marshal(toBeSaved); err != nil {
		log.Errorf("Could not create yaml from settings %v", err)
	} else if err := ioutil.WriteFile(path, bytes, 0644); err != nil {
		log.Errorf("Could not write settings file %v", err)
	} else {
		log.Debugf("Saved settings to %s with contents\n %v", path, string(bytes))
	}
}

// dump dumps settings entries to map[string]interface{} so we can save to file or
// send on wire. It only dumps the entries with persist flag if persistOnly  is
// true. It will make first letter of the id upper case when capitalize is true
// (to compatible with current Lantern UI, will be removed in next major release).
func (s *Settings) dump(persistOnly bool, capitalize bool) map[string]interface{} {
	ret := map[string]interface{}{}
	for id, v := range s.entries {
		if persistOnly && !s.persist[id] {
			continue
		}
		k := string(id)
		if capitalize {
			k = strings.ToUpper(k[:1]) + k[1:]
		}
		ret[k] = v
	}
	return ret
}

// GetProxyAll returns whether or not to proxy all traffic.
func (s *Settings) GetProxyAll() bool {
	return s.GetBool(ProxyAll)
}

// SetProxyAll sets whether or not to proxy all traffic.
func (s *Settings) SetProxyAll(proxyAll bool) {
	s.Set(ProxyAll, proxyAll)
}

// IsAutoReport returns whether or not to auto-report debugging and analytics data.
func (s *Settings) IsAutoReport() bool {
	return s.GetBool(AutoReport)
}

// SetAutoReport sets whether or not to auto-report debugging and analytics data.
func (s *Settings) SetAutoReport(auto bool) {
	s.Set(AutoReport, auto)
}

// SetAutoLaunch sets whether or not to auto-launch Lantern on system startup.
func (s *Settings) SetAutoLaunch(auto bool) {
	s.Set(AutoLaunch, auto)
}

// GetSystemProxy returns whether or not to set system proxy when lantern starts
func (s *Settings) GetSystemProxy() bool {
	return s.GetBool(SystemProxy)
}

// SetSystemProxy sets whether or not to set system proxy when lantern starts
func (s *Settings) SetSystemProxy(enable bool) {
	s.Set(SystemProxy, enable)
}

// RedirectTo tells UI to redirect to specific address
func (s *Settings) RedirectTo(addr string) {
	s.service.Out <- &msg{RedirectTo: addr}
}
