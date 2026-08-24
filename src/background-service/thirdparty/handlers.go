package thirdparty

import (
	"net/http"

	"dynatrace.com/easytrade/background-service/config"
	"dynatrace.com/easytrade/background-service/featureflag"
	"github.com/gin-gonic/gin"
)

type Handlers struct {
	runner *runner
	values config.Values
}

func New(val config.Values, flags featureflag.FlagService) *Handlers {
	r := newRunner(newCreditCardOrderClient(val.Get(creditCardOrderServiceAddress)), flags, val.MustInt(delayChancePercent))
	return &Handlers{runner: r, values: val}
}

func (h *Handlers) PostManufacturer(ctx *gin.Context) {
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
