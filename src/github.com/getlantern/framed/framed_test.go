package framed

import (
	"bytes"
	"io/ioutil"
	"runtime"
	"sync"
	"testing"

	"github.com/getlantern/testify/assert"
)

type CloseableBuffer struct {
	raw *bytes.Buffer
}

func (buffer CloseableBuffer) Read(data []byte) (n int, err error) {
	defer runtime.Gosched()
	return buffer.raw.Read(data)
}

func (buffer CloseableBuffer) Write(data []byte) (n int, err error) {
	defer runtime.Gosched()
	return buffer.raw.Write(data)
}

func (buffer CloseableBuffer) Close() (err error) {
	return
}

func TestFraming(t *testing.T) {
	testMessage := []byte("This is a test message")
	piece1 := testMessage[:8]
	piece2 := testMessage[8:]
	cb := CloseableBuffer{bytes.NewBuffer(make([]byte, 0))}
	defer cb.Close()
	writer := NewWriter(cb)
	reader := NewReader(cb)

	// Do a bunch of concurrent reads and writes to make sure we're threadsafe
	iters := 100
	var wg sync.WaitGroup
	var mu sync.Mutex
	chReadable := make(chan bool, iters)
	for i := 0; i < iters; i++ {
		wg.Add(2)
		writePieces := i%2 == 0
		readFrame := i%3 == 0

		go func() {
			defer wg.Done()
			// Write
			var n int
			var err error
			mu.Lock()
			if writePieces {
				n, err = writer.WritePieces(piece1, piece2)
			} else {
				n, err = writer.Write(testMessage)
			}
			mu.Unlock()
			chReadable <- true
			if err != nil {
				t.Errorf("Unable to write: %s", err)
			} else {
				assert.Equal(t, len(testMessage), n, "Bytes written should match length of test message")
			}
		}()

		go func() {
			defer wg.Done()
			// Read
			var frame []byte
			var n int
			var err error
			buffer := make([]byte, 100)

			<-chReadable
			mu.Lock()
			defer mu.Unlock()
			if readFrame {
				if frame, err = reader.ReadFrame(); err != nil {
					t.Errorf("Unable to read frame: %s", err)
					return
				}
			} else {
				if n, err = reader.Read(buffer); err != nil {
					t.Errorf("Unable to read: %s", err)
					return
				} else {
					assert.Equal(t, len(testMessage), n, "Bytes read should match length of test message")
				}
				frame = buffer[:n]
			}

			assert.Equal(t, testMessage, frame, "Received should match sent")
		}()
	}

	wg.Wait()
}

func TestWriteTooLong(t *testing.T) {
	w := NewWriter(ioutil.Discard)
	b := make([]byte, MaxFrameLength+1)
	n, err := w.Write(b)
	assert.Error(t, err, "Writing too long message should result in error")
	assert.Equal(t, 0, n, "Writing too long message should result in 0 bytes written")
	n, err = w.Write(b[:len(b)-1])
	assert.NoError(t, err, "Writing message of MaxFrameLength should be allowed")
	assert.Equal(t, MaxFrameLength, n, "Writing message of MaxFrameLength should have written MaxFrameLength bytes")
}

func TestWritePiecesTooLong(t *testing.T) {
	w := NewWriter(ioutil.Discard)
	b1 := make([]byte, MaxFrameLength)
	b2 := make([]byte, 1)
	n, err := w.WritePieces(b1, b2)
	assert.Error(t, err, "Writing too long message should result in error")
	assert.Equal(t, 0, n, "Writing too long message should result in 0 bytes written")
	n, err = w.WritePieces(b1[:len(b1)-1], b2)
	assert.NoError(t, err, "Writing message of MaxFrameLength should be allowed")
	assert.Equal(t, MaxFrameLength, n, "Writing message of MaxFrameLength should have written MaxFrameLength bytes")
}
