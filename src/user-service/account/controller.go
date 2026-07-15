package account

import (
	"net/http"
	"strconv"

	"dynatrace.com/easytrade/user-service/utils"
	"github.com/gin-gonic/gin"
)

var (
	managerClient = NewManagerClient()
	log           = utils.GetSugar()
)

// GetAccount handles GET /api/account/:id (v1) and GET /api/accounts/:id (v2).
func GetAccount(ctx *gin.Context) {
	accountIdStr := ctx.Param("id")
	log.Infow("GetAccount called", "accountId", accountIdStr)

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

// GetPresets handles GET /api/accounts/presets?limit=. Filters manager's account list down to
// preset (demo) accounts, mapped to ShortAccount and capped at the optional limit.
func GetPresets(ctx *gin.Context) {
	limitStr := ctx.Query("limit")
	log.Infow("GetPresets called", "limit", limitStr)

	var limit int
	if limitStr != "" {
		limit, _ = strconv.Atoi(limitStr)
	}

	accounts, err := managerClient.GetAccounts()
	if err != nil {
		ctx.String(http.StatusInternalServerError, "failed to get accounts from manager service: %v", err)
		return
	}

	presetAccounts := filterPresets(accounts)
	if limit > 0 && limit < len(presetAccounts) {
		presetAccounts = presetAccounts[:limit]
	}

	ctx.JSON(http.StatusOK, AccountsContainer{Results: presetAccounts})
}
