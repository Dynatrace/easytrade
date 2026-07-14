package account

import (
	"net/http"

	"github.com/gin-gonic/gin"
)

// GetAccount handles GET /api/account/:id (v1) and GET /api/accounts/:id (v2).
// Ported from accountservice's AccountController.java / AccountControllerV2.java.
//
// TODO: not implemented yet - this is a scaffold-only stub.
func GetAccount(ctx *gin.Context) {
	ctx.String(http.StatusNotImplemented, "not implemented")
}

// UpdateAccount handles PUT /api/account/update (v1) and PUT /api/accounts/ (v2).
// Ported from accountservice's AccountController.java / AccountControllerV2.java.
//
// TODO: not implemented yet - this is a scaffold-only stub.
func UpdateAccount(ctx *gin.Context) {
	ctx.String(http.StatusNotImplemented, "not implemented")
}

// GetPresets handles GET /api/accounts/presets?limit=. Filters manager's account list down to
// preset (demo) accounts, mapped to ShortAccount and capped at the optional limit.
// Ported from accountservice's AccountControllerV2.java.
//
// TODO: not implemented yet - this is a scaffold-only stub.
func GetPresets(ctx *gin.Context) {
	ctx.JSON(http.StatusNotImplemented, AccountsContainer{Results: []ShortAccount{}})
}
