package login

import (
	"crypto/sha256"
	"encoding/hex"
)

// HashPassword returns a SHA-256 lowercase hex digest of the plaintext password.
// Matches the algorithm in loginservice's HashUtil.cs: SHA-256, no salt.
func HashPassword(password string) string {
	sum := sha256.Sum256([]byte(password))
	return hex.EncodeToString(sum[:])
}
