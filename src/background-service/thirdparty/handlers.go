package thirdparty

import (
	"net/http"

	"github.com/gin-gonic/gin"
)

type Handlers struct {
	runner *runner
}

func (h Handlers) PostManufacturer(ctx *gin.Context) {
	var req CreditCardRequest
	if err := ctx.ShouldBindJSON(&req); err != nil ||
		req.CreditCardOrderID == "" || req.Name == "" || req.CardLevel == "" {
		ctx.JSON(http.StatusBadRequest, gin.H{
			"statusCode": http.StatusBadRequest,
			"message":    "creditCardOrderId, name and cardLevel are required",
		})
		return
	}

	h.runner.Submit(req)

	ctx.JSON(http.StatusOK, gin.H{
		"statusCode": http.StatusOK,
		"message":    "Credit card is being manufactured",
	})
}
