package config

import (
	"sync"

	"github.com/asaskevich/EventBus"
)

type meta struct {
	prec    int
	counter int
}

var (
	bus = EventBus.New()

	muMetaMap sync.RWMutex
	metaMap   = make(map[string]*meta)

	muPrecMap sync.RWMutex
	precMap   = make(map[string]int)
)

func Pub(key string, value interface{}, source string) {
	bus.Publish(key, value, source)
}

type Callback func(key string, value interface{}, source string, incr int)

func checkMeta(key string, source string) int {
	muMetaMap.Lock()
	defer muMetaMap.Unlock()
	m := metaMap[key]
	if m == nil {
		m = &meta{}
		metaMap[key] = m
	}

	muPrecMap.RLock()
	defer muPrecMap.RUnlock()
	if precMap[source] >= m.prec {
		m.counter += 1
		m.prec = precMap[source]
		return m.counter
	}
	return 0
}

func Sub(key string, cb Callback) error {
	fn := func(value interface{}, source string) {
		if counter := checkMeta(key, source); counter > 0 {
			cb(key, value, source, counter)
		}
	}
	return bus.SubscribeAsync(key, fn, true)
}

func SetPrecedence(source string, prec int) {
	muPrecMap.Lock()
	defer muPrecMap.Unlock()
	precMap[source] = prec
}
