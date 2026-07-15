package login

import (
	utils "dynatrace.com/easytrade/user-service/utils"
	"github.com/gin-gonic/gin"
	"net/http"
)

var logger = utils.GetSugar()

// Login handles POST /api/auth/login.
func Login(ctx *gin.Context) {
	ctx.JSON(http.StatusNotImplemented, ErrorResponse{Error: "not implemented"})
}

// Signup handles POST /api/auth/signup.
func Signup(ctx *gin.Context) {
	var body SignupRequest
	if err := ctx.ShouldBindJSON(&body); err != nil {
		ctx.JSON(http.StatusBadRequest, ErrorResponse{Error: err.Error()})
		return
	}

	id, err := SignupUser(body)
	if err != nil {
		if err.Error() == "user already exists" {
			ctx.JSON(http.StatusBadRequest, ErrorResponse{Error: err.Error()})
			return
		}
		logger.Errorw("signup failed", "error", err)
		ctx.JSON(http.StatusInternalServerError, ErrorResponse{Error: "internal server error"})
		return
	}

	ctx.JSON(http.StatusCreated, IdResponse{Id: id})
}
