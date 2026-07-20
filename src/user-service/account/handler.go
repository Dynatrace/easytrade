package account

import (
	"errors"
	"net/http"
	"strconv"

	"dynatrace.com/easytrade/user-service/dbadapter"
	"dynatrace.com/easytrade/user-service/utils"
	"github.com/gin-gonic/gin"
)

var logger = utils.GetSugar()

type Handler struct {
	db dbadapter.DbAdapter
}

func NewHandler(db dbadapter.DbAdapter) *Handler {
	return &Handler{db: db}
}

// Login handles POST /api/auth/login.
func (h *Handler) Login(ctx *gin.Context) {
	var body LoginRequest
	if err := ctx.ShouldBindJSON(&body); err != nil {
		ctx.JSON(http.StatusBadRequest, ErrorResponse{Error: err.Error()})
		return
	}

	acc, err := h.db.GetAccountByUsername(ctx.Request.Context(), body.Username)
	if err != nil {
		if errors.Is(err, dbadapter.ErrNotFound) {
			ctx.JSON(http.StatusUnauthorized, ErrorResponse{Error: "user not found"})
			return
		}
		logger.Errorw("login failed", "error", err)
		ctx.JSON(http.StatusInternalServerError, ErrorResponse{Error: err.Error()})
		return
	}

	if acc.HashedPassword != HashPassword(body.Password) {
		ctx.JSON(http.StatusUnauthorized, ErrorResponse{Error: "invalid password"})
		return
	}

	ctx.JSON(http.StatusOK, IdResponse{Id: acc.Id})
}

// Signup handles POST /api/auth/signup.
func (h *Handler) Signup(ctx *gin.Context) {
	var body SignupRequest
	if err := ctx.ShouldBindJSON(&body); err != nil {
		ctx.JSON(http.StatusBadRequest, ErrorResponse{Error: err.Error()})
		return
	}

	acc, err := h.db.CreateAccount(ctx.Request.Context(), body.ToCreateAccountRequest())
	if err != nil {
		logger.Errorw("signup failed", "error", err)
		ctx.JSON(http.StatusInternalServerError, ErrorResponse{Error: err.Error()})
		return
	}

	ctx.JSON(http.StatusCreated, IdResponse{Id: acc.Id})
}

// GetAccount handles GET /api/accounts/:id.
func (h *Handler) GetAccount(ctx *gin.Context) {
	accountIdStr := ctx.Param("id")
	logger.Infow("GetAccount called", "accountId", accountIdStr)

	id, err := strconv.Atoi(accountIdStr)
	if err != nil {
		ctx.String(http.StatusBadRequest, "invalid account id: %v", err)
		return
	}

	acc, err := h.db.GetAccountById(ctx.Request.Context(), id)
	if err != nil {
		if errors.Is(err, dbadapter.ErrNotFound) {
			ctx.String(http.StatusNotFound, "account not found")
			return
		}
		ctx.String(http.StatusInternalServerError, "failed to get account: %v", err)
		return
	}

	ctx.JSON(http.StatusOK, acc)
}

// GetPresets handles GET /api/accounts/presets?limit=.
func (h *Handler) GetPresets(ctx *gin.Context) {
	limitStr := ctx.Query("limit")
	logger.Infow("GetPresets called", "limit", limitStr)

	var limit int
	if limitStr != "" {
		limit, _ = strconv.Atoi(limitStr)
	}

	accounts, err := h.db.GetAccounts(ctx.Request.Context())
	if err != nil {
		ctx.String(http.StatusInternalServerError, "failed to get accounts: %v", err)
		return
	}

	presetAccounts := filterPresets(accounts)
	if limit > 0 && limit < len(presetAccounts) {
		presetAccounts = presetAccounts[:limit]
	}

	ctx.JSON(http.StatusOK, AccountsContainer{Results: presetAccounts})
}
