package flag

import (
	"errors"
	"testing"
)

func testFlags() map[string]*Flag {
	return map[string]*Flag{
		"FLAG_1": {ID: "FLAG_1", Enabled: true, Name: "TEST FLAG 1", Description: "Test flag 1", IsModifiable: true, Tag: "config"},
		"FLAG_2": {ID: "FLAG_2", Enabled: false, Name: "TEST FLAG 2", Description: "Test flag 2", IsModifiable: true, Tag: "problem_pattern"},
		"FLAG_3": {ID: "FLAG_3", Enabled: true, Name: "TEST FLAG 3", Description: "Test flag 3", IsModifiable: false, Tag: "config"},
	}
}

func TestGetByID_existingFlag_returnsFlag(t *testing.T) {
	svc := NewService(testFlags())
	f, ok := svc.GetByID("FLAG_1")
	if !ok {
		t.Fatal("expected flag to be found")
	}
	if f.ID != "FLAG_1" {
		t.Errorf("expected id FLAG_1, got %s", f.ID)
	}
}

func TestGetByID_unknownID_notFound(t *testing.T) {
	svc := NewService(testFlags())
	_, ok := svc.GetByID("MISSING")
	if ok {
		t.Error("expected flag to not be found")
	}
}

func TestGetAll_returnsAllFlags(t *testing.T) {
	svc := NewService(testFlags())
	flags := svc.GetAll()
	if len(flags) != 3 {
		t.Errorf("expected 3 flags, got %d", len(flags))
	}
}

func TestGetByTag_knownTag_returnsMatching(t *testing.T) {
	svc := NewService(testFlags())
	flags := svc.GetByTag("config")
	if len(flags) != 2 {
		t.Errorf("expected 2 config flags, got %d", len(flags))
	}
	for _, f := range flags {
		if f.Tag != "config" {
			t.Errorf("expected tag config, got %s", f.Tag)
		}
	}
}

func TestGetByTag_unknownTag_returnsEmpty(t *testing.T) {
	svc := NewService(testFlags())
	flags := svc.GetByTag("no_such_tag")
	if len(flags) != 0 {
		t.Errorf("expected 0 flags, got %d", len(flags))
	}
}

func TestUpdate_modifiableFlag_updatesEnabled(t *testing.T) {
	svc := NewService(testFlags())
	f, err := svc.Update("FLAG_1", false)
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	if f.Enabled != false {
		t.Error("expected enabled to be false")
	}
}

func TestUpdate_nonModifiableFlag_returnsNonModifiableError(t *testing.T) {
	svc := NewService(testFlags())
	_, err := svc.Update("FLAG_3", false)
	if err == nil {
		t.Fatal("expected error for non-modifiable flag")
	}
	var nme *NonModifiableError
	if !errors.As(err, &nme) {
		t.Errorf("expected NonModifiableError, got %T", err)
	}
}

func TestUpdate_unknownFlag_returnsErrFlagNotFound(t *testing.T) {
	svc := NewService(testFlags())
	_, err := svc.Update("MISSING", true)
	if !errors.Is(err, ErrFlagNotFound) {
		t.Errorf("expected ErrFlagNotFound, got %v", err)
	}
}
