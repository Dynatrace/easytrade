package login

import (
	"crypto/sha256"
	"encoding/hex"
)

// HashPassword returns a SHA-256 lowercase hex digest of the plaintext password. No salt.
func HashPassword(password string) string {
	sum := sha256.Sum256([]byte(password))
	return hex.EncodeToString(sum[:])
}
