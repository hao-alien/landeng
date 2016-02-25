package detour

type connQueue struct {
	conns []conn
}

func (q *connQueue) Add(c conn) {
	q.conns = append(q.conns, c)
}

func (q *connQueue) Remove(r conn) {
	q.Foreach(func(c conn) bool {
		return c != r
	})
}

func (q *connQueue) First() (c conn) {
	// will panic if len(q.conns) == 0, expected
	return q.conns[0]
}

func (q *connQueue) Len() int {
	return len(q.conns)
}

// loop on each connection in this queue.
// return true to keep the connection, or drop it.
func (q *connQueue) Foreach(f func(c conn) bool) {
	newConns := []conn{}
	tries := q.Len()
	for i := 0; i < tries; i++ {
		c := q.conns[i]
		if f(c) {
			newConns = append(newConns, c)
		}
	}
	q.conns = newConns
}
