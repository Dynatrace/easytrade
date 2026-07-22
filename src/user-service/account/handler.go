package account

import (
	"net/http"
	"strconv"

	"dynatrace.com/easytrade/user-service/dbadapter/proto"
	"dynatrace.com/easytrade/user-service/utils"
	"github.com/gin-gonic/gin"
	"google.golang.org/grpc/codes"
	"google.golang.org/grpc/status"
	"google.golang.org/protobuf/types/known/emptypb"
)

var logger = utils.GetSugar()

type Handler struct {
	client proto.AccountServiceClient
}

func NewHandler(client proto.AccountServiceClient) *Handler {
	return &Handler{client: client}
}

// Login handles POST /api/auth/login.
func (h *Handler) Login(ctx *gin.Context) {
	var body LoginRequest
	if err := ctx.ShouldBindJSON(&body); err != nil {
		ctx.JSON(http.StatusBadRequest, ErrorResponse{Error: err.Error()})
		return
	}

	acc, err := h.client.GetAccountByUsername(ctx.Request.Context(), &proto.GetAccountByUsernameRequest{Username: body.Username})
	if err != nil {
		if status.Code(err) == codes.NotFound {
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

	acc, err := h.client.CreateAccount(ctx.Request.Context(), body.ToCreateAccountRequest())
	if err != nil {
		logger.Errorw("signup failed", "error", err)
		ctx.JSON(http.StatusInternalServerError, ErrorResponse{Error: err.Error()})
		return
	}

	ctx.JSON(http.StatusCreated, IdResponse{Id: acc.Id})
}

// GetAccount handles GET /api/accounts/:id.
func (h *Handler) GetAccount(ctx *gin.Context) {
	id := ctx.Param("id")
	logger.Infow("GetAccount called", "accountId", id)

	acc, err := h.client.GetAccountById(ctx.Request.Context(), &proto.GetAccountByIdRequest{Id: id})
	if err != nil {
		if status.Code(err) == codes.NotFound {
			ctx.String(http.StatusNotFound, "account not found")
			return
		}
		ctx.String(http.StatusInternalServerError, "failed to get account: %v", err)
		return
	}

	ctx.JSON(http.StatusOK, toAccountResponse(acc))
}

// GetPresets handles GET /api/accounts/presets?limit=.
func (h *Handler) GetPresets(ctx *gin.Context) {
	limitStr := ctx.Query("limit")
	logger.Infow("GetPresets called", "limit", limitStr)

	var limit int
	if limitStr != "" {
		limit, _ = strconv.Atoi(limitStr)
	}

	resp, err := h.client.GetAccounts(ctx.Request.Context(), &emptypb.Empty{})
	if err != nil {
		ctx.String(http.StatusInternalServerError, "failed to get accounts: %v", err)
		return
	}

	presetAccounts := filterPresets(resp.Accounts)
	if limit > 0 && limit < len(presetAccounts) {
		presetAccounts = presetAccounts[:limit]
	}

	ctx.JSON(http.StatusOK, AccountsContainer{Results: presetAccounts})
}
