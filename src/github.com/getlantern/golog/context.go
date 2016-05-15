package golog

import (
	"bytes"
	"fmt"
	"sort"

	"github.com/getlantern/gls"
)

var (
	ctx = gls.NewContextManager()
)

// Map is a map of values
type Map gls.Values

func WithContext(values Map, fn func()) {
	ctx.SetValues(gls.Values(values), fn)
}

func Go(fn func()) {
	gls.Go(fn)
}

func printContextTo(buf *bytes.Buffer) {
	values := ctx.GetAll()
	if values != nil && len(values) > 0 {
		buf.WriteString(" [")
		var keys []string
		for key := range values {
			keys = append(keys, key.(string))
		}
		sort.Strings(keys)
		for i, key := range keys {
			value := values[key]
			if i > 0 {
				buf.WriteString(" ")
			}
			buf.WriteString(key)
			buf.WriteString("=")
			fmt.Fprintf(buf, "%v", value)
		}
		buf.WriteByte(']')
	}
}
