package account

import (
	"github.com/gin-gonic/gin"
	"net/http"
	"strconv"
)

var managerClient = NewManagerClient()

// GetAccount handles GET /api/account/:id (v1) and GET /api/accounts/:id (v2).
// Ported from accountservice's AccountController.java / AccountControllerV2.java.
func GetAccount(ctx *gin.Context) {
	accountIdStr := ctx.Param("id")

	id, err := strconv.Atoi(accountIdStr)

	if err != nil {
		ctx.String(http.StatusBadRequest, "invalid account id: %v", err)
		return
	}

	managerAccount, err := managerClient.GetAccountById(id)

	if err != nil {
		ctx.String(http.StatusInternalServerError, "failed to get account from manager service: %v", err)
		return
	}

	ctx.JSON(http.StatusOK, managerAccount)
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
