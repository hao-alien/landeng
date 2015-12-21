package detour

type connQueue struct {
	chConns chan conn
}

func newConnQueue(n int) *connQueue {
	return &connQueue{make(chan conn, n)}
}

func (q *connQueue) Add(c conn) {
	q.chConns <- c
}

func (q *connQueue) Remove(r conn) {
	q.Foreach(func(c conn) bool {
		return c != r
	})
}

func (q *connQueue) Next() (c conn) {
	c = <-q.chConns
	q.chConns <- c
	return
}

func (q *connQueue) Len() int {
	return len(q.chConns)
}

// loop on each connection in this queue.
// return true to keep the connection, or drop it.
func (q *connQueue) Foreach(f func(c conn) bool) {
	tries := q.Len()
	for i := 0; i < tries; i++ {
		c := <-q.chConns
		if f(c) {
			q.chConns <- c
		}
	}
}
