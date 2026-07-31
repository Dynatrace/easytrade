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
	"google.golang.org/grpc/codes"
	"google.golang.org/grpc/status"
	"google.golang.org/protobuf/types/known/emptypb"
)

func GetCurrentPrices(ctx *gin.Context) {
	prices, ok := fetchAndMap(ctx, func() (*pb.PricesResponse, error) {
		return services.PricingClient.GetLatestPrices(context.Background(), &emptypb.Empty{})
	}, func(r *pb.PricesResponse) []price { return pricesFromProto(r.GetPrices()) })
	if !ok {
		return
	}
	respondWithPricesAndPublish(ctx, &pricesResult{Results: prices}, prices)
}

func GetLastPrice(ctx *gin.Context) {
	instrumentId, ok := parseUUIDQuery(ctx, "instrumentId")
	if !ok {
		return
	}
	lastPrice, ok := fetchAndMap(ctx, func() (*pb.PriceMessage, error) {
		return services.PricingClient.GetLatestPriceForInstrument(context.Background(), &pb.GetLatestPriceForInstrumentRequest{
			InstrumentId: instrumentId.String(),
		})
	}, priceFromProto)
	if !ok {
		return
	}
	negotiateResponse(ctx, http.StatusOK, &lastPrice)
	services.SendDataToRabbitQueue(buildPricesCSV([]price{lastPrice}, utils.RandomIntProvider{}))
}

func GetPricingDataForInstrument(ctx *gin.Context) {
	instrumentId, ok := parseUUIDParam(ctx, "instrumentId")
	if !ok {
		return
	}
	recordsI32 := parseRecordsLimit(ctx)
	prices, ok := fetchAndMap(ctx, func() (*pb.PricesResponse, error) {
		return services.PricingClient.GetPricesForInstrument(context.Background(), &pb.GetPricesForInstrumentRequest{
			InstrumentId: instrumentId.String(),
			Limit:        &recordsI32,
		})
	}, func(r *pb.PricesResponse) []price { return pricesFromProto(r.GetPrices()) })
	if !ok {
		return
	}
	respondWithPricesAndPublish(ctx, &pricesResult{Results: prices}, prices)
}

func parseRecordsLimit(ctx *gin.Context) int32 {
	n, _ := strconv.Atoi(ctx.DefaultQuery("records", "100"))
	return int32(n)
}

func fetchAndMap[R, T any](ctx *gin.Context, call func() (R, error), mapper func(R) T) (T, bool) {
	resp, err := call()
	if handleInternalError(ctx, err) {
		var zero T
		return zero, false
	}
	return mapper(resp), true
}

func parseUUIDParam(ctx *gin.Context, param string) (uuid.UUID, bool) {
	return parseUUID(ctx, param, ctx.Param)
}

func parseUUIDQuery(ctx *gin.Context, param string) (uuid.UUID, bool) {
	return parseUUID(ctx, param, ctx.Query)
}

func parseUUID(ctx *gin.Context, param string, extract func(string) string) (uuid.UUID, bool) {
	id, err := uuid.Parse(extract(param))
	if err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "invalid " + param})
		return uuid.Nil, false
	}
	return id, true
}

func respondWithPricesAndPublish(ctx *gin.Context, response any, prices []price) {
	negotiateResponse(ctx, http.StatusOK, response)
	services.SendDataToRabbitQueue(buildPricesCSV(prices, utils.RandomIntProvider{}))
}

func handleInternalError(ctx *gin.Context, err error) bool {
	if err == nil {
		return false
	}
	log.Error(err)
	if st, ok := status.FromError(err); ok && st.Code() == codes.NotFound {
		ctx.JSON(http.StatusNotFound, gin.H{"error": err.Error()})
	} else {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
	}
	return true
}

func priceFromProto(msg *pb.PriceMessage) price {
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

func pricesFromProto(msgs []*pb.PriceMessage) []price {
	result := make([]price, 0, len(msgs))
	for _, m := range msgs {
		result = append(result, priceFromProto(m))
	}
	return result
}

func buildPricesCSV(priceList []price, provider utils.IntProvider) string {
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
