package services

import (
	"sync"
	"time"
)

type cachedEntry[T any] struct {
	value     T
	expiresAt time.Time
}

type TTLCache[T any] struct {
	mu    sync.RWMutex
	entry *cachedEntry[T]
	ttl   time.Duration
}

func NewTTLCache[T any](ttl time.Duration) *TTLCache[T] {
	return &TTLCache[T]{ttl: ttl}
}

func (c *TTLCache[T]) Get() (T, bool) {
	c.mu.RLock()
	defer c.mu.RUnlock()
	if c.entry != nil && time.Now().Before(c.entry.expiresAt) {
		return c.entry.value, true
	}
	var zero T
	return zero, false
}

func (c *TTLCache[T]) Set(value T) {
	c.mu.Lock()
	defer c.mu.Unlock()
	c.entry = &cachedEntry[T]{value: value, expiresAt: time.Now().Add(c.ttl)}
}
