package contentcreator

import (
	"context"
	"time"

	"google.golang.org/protobuf/types/known/timestamppb"

	proto "dynatrace.com/easytrade/background-service/proto"
)

const aggregatorOrigin = "AGGREGATOR"

func (h *Handler) insertPricingBatch(ctx context.Context, rows []candle) error {
	if len(rows) == 0 {
		return nil
	}
	pbRows := make([]*proto.PricingRow, len(rows))
	for i, r := range rows {
		pbRows[i] = &proto.PricingRow{
			Timestamp:    timestamppb.New(r.Timestamp),
			InstrumentId: r.InstrumentID,
			Open:         r.Open,
			High:         r.High,
			Low:          r.Low,
			Close:        r.Close,
		}
	}
	_, err := h.pricing.InsertPricesBatch(ctx, &proto.InsertPricesBatchRequest{Rows: pbRows})
	return err
}

func (h *Handler) deletePricingBeforeDate(ctx context.Context, before time.Time) error {
	_, err := h.pricing.DeletePricesOlderThan(ctx, &proto.DeleteBeforeRequest{
		Before: timestamppb.New(before),
	})
	return err
}

func (h *Handler) deleteTradesBeforeDate(ctx context.Context, before time.Time) error {
	_, err := h.trade.DeleteTradesOlderThan(ctx, &proto.DeleteBeforeRequest{
		Before: timestamppb.New(before),
	})
	return err
}

func (h *Handler) deleteBalanceHistoryBeforeDate(ctx context.Context, before time.Time) error {
	_, err := h.balance.DeleteBalanceHistoryOlderThan(ctx, &proto.DeleteBeforeRequest{
		Before: timestamppb.New(before),
	})
	return err
}

func (h *Handler) deleteStaleAccounts(ctx context.Context, before time.Time) error {
	_, err := h.account.DeleteAccountsOlderThan(ctx, &proto.DeleteAccountsOlderThanRequest{
		Before: timestamppb.New(before),
		Origin: aggregatorOrigin,
	})
	return err
}
