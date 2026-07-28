package thirdparty

import (
	"slices"
	"sync"
)

type queue[T comparable] struct {
	mu    sync.Mutex
	items []T
}

func newQueue[T comparable]() *queue[T] { return &queue[T]{} }

func (q *queue[T]) add(item T) {
	q.mu.Lock()
	defer q.mu.Unlock()
	q.items = append(q.items, item)
}

func (q *queue[T]) snapshot() []T {
	q.mu.Lock()
	defer q.mu.Unlock()
	out := make([]T, len(q.items))
	copy(out, q.items)
	return out
}

func (q *queue[T]) remove(toRemove []T) {
	if len(toRemove) == 0 {
		return
	}
	q.mu.Lock()
	defer q.mu.Unlock()
	remaining := q.items[:0]
	for _, item := range q.items {
		if !slices.Contains(toRemove, item) {
			remaining = append(remaining, item)
		}
	}
	q.items = remaining
}
