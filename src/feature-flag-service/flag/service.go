package flag

import "sync"

type Service struct {
	mu    sync.RWMutex
	flags map[string]*Flag
}

func NewService(flags map[string]*Flag) *Service {
	return &Service{flags: flags}
}

func (s *Service) GetByID(id string) (*Flag, bool) {
	s.mu.RLock()
	defer s.mu.RUnlock()
	f, ok := s.flags[id]
	return f, ok
}

func (s *Service) GetAll() []*Flag {
	s.mu.RLock()
	defer s.mu.RUnlock()
	result := make([]*Flag, 0, len(s.flags))
	for _, f := range s.flags {
		result = append(result, f)
	}
	return result
}

func (s *Service) GetByTag(tag string) []*Flag {
	s.mu.RLock()
	defer s.mu.RUnlock()
	result := make([]*Flag, 0)
	for _, f := range s.flags {
		if f.Tag == tag {
			result = append(result, f)
		}
	}
	return result
}

func (s *Service) Update(id string, enabled bool) (*Flag, error) {
	s.mu.Lock()
	defer s.mu.Unlock()
	f, ok := s.flags[id]
	if !ok {
		return nil, ErrFlagNotFound
	}
	if !f.IsModifiable {
		return nil, &NonModifiableError{Name: f.Name}
	}
	f.Enabled = enabled
	return f, nil
}
