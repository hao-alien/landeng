package ui

type EnvelopeType struct {
	Type string `yaml: "type"`
}

// Envelope is a struct that wraps messages and associates them with a type.
type Envelope struct {
	EnvelopeType `yaml: "type"`
	Message      interface{} `yaml: "message"`
}
