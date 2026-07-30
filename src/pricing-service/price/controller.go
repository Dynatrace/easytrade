package price

import (
	"context"
	"net/http"
	"strconv"
	"strings"
	"time"

	pb "dynatrace.com/easytrade/pricing-service/proto"
	"dynatrace.com/easytrade/pricing-service/services"
	"dynatrace.com/easytrade/pricing-service/utils"
	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	log "github.com/sirupsen/logrus"
	"google.golang.org/protobuf/types/known/emptypb"
)

func GetCurrentPrices(ctx *gin.Context) {
	prices, ok := fetchAndMap(ctx, func() (*pb.PricesResponse, error) {
		return services.PricingClient.GetLatestPrices(context.Background(), &emptypb.Empty{})
	})
	if !ok {
		return
	}
	respondAndPublish(ctx, &pricesResult{Results: prices}, prices)
}

func GetLastPrice(ctx *gin.Context) {
	prices, ok := fetchAndMap(ctx, func() (*pb.PricesResponse, error) {
		return services.PricingClient.GetLatestPrices(context.Background(), &emptypb.Empty{})
	})
	if !ok {
		return
	}
	if len(prices) == 0 {
		ctx.JSON(http.StatusNotFound, gin.H{"error": "no prices found"})
		return
	}
	respondAndPublish(ctx, &prices[0], []price{prices[0]})
}

func GetPricingDataForInstrument(ctx *gin.Context) {
	instrumentId, ok := parseUUIDParam(ctx, "instrumentId")
	if !ok {
		return
	}
	records, _ := strconv.Atoi(ctx.DefaultQuery("records", "100"))
	recordsI32 := int32(records)

	prices, ok := fetchAndMap(ctx, func() (*pb.PricesResponse, error) {
		return services.PricingClient.GetPricesForInstrument(context.Background(), &pb.GetPricesForInstrumentRequest{
			InstrumentId: instrumentId.String(),
			Limit:        &recordsI32,
		})
	})
	if !ok {
		return
	}
	respondAndPublish(ctx, &pricesResult{Results: prices}, prices)
}

func fetchAndMap(ctx *gin.Context, call func() (*pb.PricesResponse, error)) ([]price, bool) {
	resp, err := call()
	if internalError(ctx, err) {
		return nil, false
	}
	return listFromProto(resp.GetPrices()), true
}

func parseUUIDParam(ctx *gin.Context, param string) (uuid.UUID, bool) {
	id, err := uuid.Parse(ctx.Param(param))
	if err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "invalid " + param})
		return uuid.Nil, false
	}
	return id, true
}

func respondAndPublish(ctx *gin.Context, response any, prices []price) {
	negotiateResponse(ctx, http.StatusOK, response)
	services.SendDataToRabbitQueue(prepareCSV(prices, utils.RandomIntProvider{}))
}

func internalError(ctx *gin.Context, err error) bool {
	if err == nil {
		return false
	}
	log.Error(err)
	ctx.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
	return true
}

func fromProto(msg *pb.PriceMessage) price {
	var ts time.Time
	if msg.GetTimestamp() != nil {
		ts = msg.GetTimestamp().AsTime()
	}
	return price{
		Id:           uuid.MustParse(msg.GetId()),
		InstrumentId: uuid.MustParse(msg.GetInstrumentId()),
		Timestamp:    ts,
		Open:         msg.GetOpen(),
		High:         msg.GetHigh(),
		Low:          msg.GetLow(),
		Close:        msg.GetClose(),
	}
}

func listFromProto(msgs []*pb.PriceMessage) []price {
	result := make([]price, 0, len(msgs))
	for _, m := range msgs {
		result = append(result, fromProto(m))
	}
	return result
}

func prepareCSV(priceList []price, provider utils.IntProvider) string {
	var stringBuilder strings.Builder
	stringBuilder.WriteString("date, open, high, low, close, volume\n")
	for _, item := range priceList {
		stringBuilder.WriteString(item.toCSV(provider.Intn(100) + 100))
	}
	return stringBuilder.String()
}

func negotiateResponse(ctx *gin.Context, status int, data any) {
	ctx.Negotiate(status, gin.Negotiate{
		Offered: []string{gin.MIMEJSON, gin.MIMEXML},
		Data:    data,
	})
}
