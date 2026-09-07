package price

import (
	"context"
	"net/http"
	"strconv"
	"time"

	pb "dynatrace.com/easytrade/pricing-service/proto"
	"dynatrace.com/easytrade/pricing-service/utils"
	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"google.golang.org/grpc/codes"
	"google.golang.org/grpc/status"
	"google.golang.org/protobuf/types/known/emptypb"
	"google.golang.org/protobuf/types/known/timestamppb"
)

type Handler struct {
	client pb.PricingServiceClient
}

func NewHandler(client pb.PricingServiceClient) *Handler {
	return &Handler{client: client}
}

func (h *Handler) GetCurrentPrices(ctx *gin.Context) {
	resp, err := h.client.GetLatestPrices(context.Background(), &emptypb.Empty{})
	if handleInternalError(ctx, err) {
		return
	}
	negotiateResponse(ctx, http.StatusOK, &pricesResult{Results: pricesFromProto(resp.GetPrices())})
}

func (h *Handler) GetLastPrice(ctx *gin.Context) {
	instrumentId, ok := parseUUIDQuery(ctx, "instrumentId")
	if !ok {
		return
	}
	resp, err := h.client.GetLatestPriceForInstrument(context.Background(), &pb.GetLatestPriceForInstrumentRequest{
		InstrumentId: instrumentId.String(),
	})
	if handleInternalError(ctx, err) {
		return
	}
	p := priceFromProto(resp)
	negotiateResponse(ctx, http.StatusOK, &p)
}

func (h *Handler) GetPricingDataForInstrument(ctx *gin.Context) {
	instrumentId, ok := parseUUIDParam(ctx, "instrumentId")
	if !ok {
		return
	}
	recordsI32 := parseRecordsLimit(ctx)
	resp, err := h.client.GetPricesForInstrument(context.Background(), &pb.GetPricesForInstrumentRequest{
		InstrumentId: instrumentId.String(),
		Limit:        &recordsI32,
	})
	if handleInternalError(ctx, err) {
		return
	}
	negotiateResponse(ctx, http.StatusOK, &pricesResult{Results: pricesFromProto(resp.GetPrices())})
}

func (h *Handler) GetPricingDataForInstrumentsAscByTimestamp(ctx *gin.Context) {
	since, ok := parseSinceQuery(ctx, "since")
	if !ok {
		return
	}

	resp, err := h.client.GetPricesForInstrumentsAscByTimestamp(context.Background(), &pb.GetPricesForInstrumentsAscByTimestampRequest{
		Since: timestamppb.New(since),
	})
	if handleInternalError(ctx, err) {
		return
	}
	negotiateResponse(ctx, http.StatusOK, &pricesResult{Results: pricesFromProto(resp.GetPrices())})
}

func parseSinceQuery(ctx *gin.Context, param string) (time.Time, bool) {
	raw := ctx.Query(param)
	if raw == "" {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": param + " is required"})
		return time.Time{}, false
	}
	since, err := time.Parse(time.RFC3339, raw)
	if err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "invalid " + param})
		return time.Time{}, false
	}
	return since, true
}

func parseRecordsLimit(ctx *gin.Context) int32 {
	n, _ := strconv.Atoi(ctx.DefaultQuery("records", "100"))
	return int32(n)
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

func handleInternalError(ctx *gin.Context, err error) bool {
	if err == nil {
		return false
	}
	utils.GetSugar().Error(err)
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

func negotiateResponse(ctx *gin.Context, status int, data any) {
	ctx.Negotiate(status, gin.Negotiate{
		Offered: []string{gin.MIMEJSON, gin.MIMEXML},
		Data:    data,
	})
}
