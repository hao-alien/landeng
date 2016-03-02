package main

import (
	"os"
	"testing"

	"github.com/stretchr/testify/assert"
)

func TestNotPersistVersion(t *testing.T) {
	path = "./test.yaml"
	version := "version-not-on-disk"
	revisionDate := "1970-1-1"
	buildDate := "1970-1-1"
	LoadSettings(version, revisionDate, buildDate)
	assert.Equal(t, settings.entries[ProxyAll], true, "Should load from file")
	assert.Equal(t, settings.entries[Version], version, "Should be set to version")
}

func TestManipulateentries(t *testing.T) {
	path = "./TestManipulateentries.yaml"
	defer os.Remove(path)
	var prev, cur interface{}
	testId := id("testId")
	s := New(entries{}, false)
	s.AddNotifier(testId, func(p, c interface{}) {
		prev, cur = p, c
	})

	s.Set(testId, "abc")
	assert.Equal(t, s.Get(testId), "abc")
	assert.Equal(t, s.GetString(testId), "abc")
	assert.Equal(t, prev, nil, "should call notifier with correct prev value")
	assert.Equal(t, cur, "abc", "should call notifier with correct cur value")

	s.Set(testId, true)
	assert.Equal(t, s.Get(testId), true)
	assert.Equal(t, s.GetBool(testId), true)
	assert.Equal(t, prev, "abc", "should call notifier with correct prev value")
	assert.Equal(t, cur, true, "should call notifier with correct cur value")
}
