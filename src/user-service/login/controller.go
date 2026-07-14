package login

import (
	"net/http"

	"github.com/gin-gonic/gin"
)

// Login handles POST /api/Login.
// Ported from loginservice's LoginController.cs.
//
// TODO: not implemented yet - this is a scaffold-only stub.
func Login(ctx *gin.Context) {
	ctx.JSON(http.StatusNotImplemented, ErrorResponse{Error: "not implemented"})
}

// Signup handles POST /api/Signup.
// Ported from loginservice's SignupController.cs.
//
// TODO: not implemented yet - this is a scaffold-only stub.
func Signup(ctx *gin.Context) {
	ctx.JSON(http.StatusNotImplemented, ErrorResponse{Error: "not implemented"})
}

// GetAccountById handles GET /api/Accounts/GetAccountById/:id.
// Ported from loginservice's AccountsController.cs.
//
// TODO: not implemented yet - this is a scaffold-only stub.
func GetAccountById(ctx *gin.Context) {
	ctx.JSON(http.StatusNotImplemented, ErrorResponse{Error: "not implemented"})
}

// GetAccountByUsername handles GET /api/Accounts/GetAccountByUsername/:username.
// Ported from loginservice's AccountsController.cs.
//
// TODO: not implemented yet - this is a scaffold-only stub.
func GetAccountByUsername(ctx *gin.Context) {
	ctx.JSON(http.StatusNotImplemented, ErrorResponse{Error: "not implemented"})
}

// CreateNewAccount handles POST /api/Accounts/CreateNewAccount.
// Ported from loginservice's AccountsController.cs.
//
// TODO: not implemented yet - this is a scaffold-only stub.
func CreateNewAccount(ctx *gin.Context) {
	ctx.JSON(http.StatusNotImplemented, ErrorResponse{Error: "not implemented"})
}
