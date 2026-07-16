package login

import (
	utils "dynatrace.com/easytrade/user-service/utils"
	"github.com/gin-gonic/gin"
	"net/http"
)

var logger = utils.GetSugar()

// Login handles POST /api/auth/login.
func Login(ctx *gin.Context) {
	logger.Infow("login request received", "body", ctx.Request.Body)
	var body LoginRequest
	if err := ctx.ShouldBindJSON(&body); err != nil {
		ctx.JSON(http.StatusBadRequest, ErrorResponse{Error: err.Error()})
		return
	}

	id, err := LoginUser(body.Username, body.Password)
	if err != nil {
		logger.Errorw("login failed", "error", err)
		ctx.JSON(http.StatusUnauthorized, ErrorResponse{Error: err.Error()})
		return
	}

	ctx.JSON(http.StatusOK, IdResponse{Id: id})
}

// Signup handles POST /api/auth/signup.
func Signup(ctx *gin.Context) {
	logger.Infow("signup request received", "body", ctx.Request.Body)
	var body SignupRequest
	if err := ctx.ShouldBindJSON(&body); err != nil {
		ctx.JSON(http.StatusBadRequest, ErrorResponse{Error: err.Error()})
		return
	}

	id, err := SignupUser(body)
	if err != nil {
		logger.Errorw("signup failed", "error", err)
		ctx.JSON(http.StatusInternalServerError, ErrorResponse{Error: err.Error()})
		return
	}

	ctx.JSON(http.StatusCreated, IdResponse{Id: id})
}
