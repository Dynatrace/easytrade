package price

import (
	"net/http"
	"strconv"

	"dynatrace.com/easytrade/pricing-service/services"
	"github.com/gin-gonic/gin"

	log "github.com/sirupsen/logrus"
)

// @Summary		Get instrument prices
// @Description	Get current price of each instrument
// @Tags			Pricing-service
// @Accept			*/*
// @Produce		json
// @Produce		application/xml
// @Success		200	{object}	price.pricesResult
// @Router			/v1/prices/latest [get]
func GetCurrentPrices(ctx *gin.Context) {
	log.Info("Getting current prices")

	var priceList []price

	services.DB.Where("Timestamp = (?)", services.DB.Table("Pricing").Select("max(Timestamp)")).Find(&priceList)

	negotiateResponse(ctx, http.StatusOK, &pricesResult{
		Results: priceList,
	})
}

// @Summary		Get instrument price
// @Description	Get last price of instrument
// @Tags			Pricing-service
// @Accept			*/*
// @Produce		json
// @Produce		application/xml
// @Success		200	{object}	price.price
// @Router			/v1/prices/last [get]
func GetLastPrice(ctx *gin.Context) {
	log.Info("Getting last price")

	var lastPrice price

	services.DB.Last(&lastPrice)

	negotiateResponse(ctx, http.StatusOK, &lastPrice)
}

// @Summary		Get prices of a particular instrument
// @Description	Get specific number of records of particular instrument
// @Tags			Pricing-service
// @Accept			*/*
// @Produce		json
// @Produce		application/xml
// @Success		200	{object}	price.pricesResult
// @Router			/v1/prices/instrument/{instrumentId} [get]
// @Param			instrumentId	path	int	true	"Instrument id"
// @Param			records			query	int	false	"Number of records"
func GetPricingDataForInstrument(ctx *gin.Context) {
	instrumentId := ctx.Param("instrumentId")
	records, _ := strconv.Atoi(ctx.DefaultQuery("records", "100"))

	log.WithFields(log.Fields{
		"instrumentId": instrumentId,
		"records":      records,
	}).Info("Getting pricing data for instrument")

	var priceList []price

	services.DB.Table("Pricing").Where("instrumentId = ?", instrumentId).Order("Timestamp desc").Limit(records).Scan(&priceList)

	negotiateResponse(ctx, http.StatusOK, &pricesResult{
		Results: priceList,
	})
}

func negotiateResponse(ctx *gin.Context, status int, data any) {
	ctx.Negotiate(status, gin.Negotiate{
		Offered: []string{gin.MIMEJSON, gin.MIMEXML},
		Data:    data,
	})
}
