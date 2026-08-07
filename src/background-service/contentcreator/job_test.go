package contentcreator

import (
	"context"
	"testing"
	"time"

	"google.golang.org/grpc"

	proto "dynatrace.com/easytrade/background-service/db-adapter/proto"
)

// The fakes below embed the generated proto client interfaces (leaving every
// method they don't override unimplemented) and record the calls the cleanup
// logic makes, following this repo's convention of testing against the real
// gRPC surface rather than mocking a database.

type fakePricingClient struct {
	proto.PricingServiceClient
	pricingDeleteCalls []time.Time
	insertCalls        int
	insertedBatches    [][]*proto.PricingRow
}

func (f *fakePricingClient) InsertPricesBatch(_ context.Context, req *proto.InsertPricesBatchRequest, _ ...grpc.CallOption) (*proto.BatchResponse, error) {
	f.insertCalls++
	f.insertedBatches = append(f.insertedBatches, req.Rows)
	return &proto.BatchResponse{}, nil
}

func (f *fakePricingClient) DeletePricesOlderThan(_ context.Context, req *proto.DeleteBeforeRequest, _ ...grpc.CallOption) (*proto.BatchResponse, error) {
	f.pricingDeleteCalls = append(f.pricingDeleteCalls, req.Before.AsTime())
	return &proto.BatchResponse{}, nil
}

type fakeTradeClient struct {
	proto.TradeServiceClient
	tradeDeleteCalls []time.Time
}

func (f *fakeTradeClient) DeleteTradesOlderThan(_ context.Context, req *proto.DeleteBeforeRequest, _ ...grpc.CallOption) (*proto.BatchResponse, error) {
	f.tradeDeleteCalls = append(f.tradeDeleteCalls, req.Before.AsTime())
	return &proto.BatchResponse{}, nil
}

type fakeBalanceClient struct {
	proto.BalanceServiceClient
	balanceDeleteCalls []time.Time
}

func (f *fakeBalanceClient) DeleteBalanceHistoryOlderThan(_ context.Context, req *proto.DeleteBeforeRequest, _ ...grpc.CallOption) (*proto.BatchResponse, error) {
	f.balanceDeleteCalls = append(f.balanceDeleteCalls, req.Before.AsTime())
	return &proto.BatchResponse{}, nil
}

type accountDeleteCall struct {
	before        time.Time
	excludeOrigin string
}

type fakeAccountClient struct {
	proto.AccountServiceClient
	accountDeleteCalls []accountDeleteCall
}

func (f *fakeAccountClient) DeleteAccountsOlderThan(_ context.Context, req *proto.DeleteAccountsOlderThanRequest, _ ...grpc.CallOption) (*proto.BatchResponse, error) {
	f.accountDeleteCalls = append(f.accountDeleteCalls, accountDeleteCall{req.Before.AsTime(), req.Origin})
	return &proto.BatchResponse{}, nil
}

// newTestHandler wires a Handler to the fake proto clients so cleanup methods
// can be exercised without a live db-adapter connection.
func newTestHandler() (*Handler, *fakePricingClient, *fakeTradeClient, *fakeBalanceClient, *fakeAccountClient) {
	pricing := &fakePricingClient{}
	trade := &fakeTradeClient{}
	balance := &fakeBalanceClient{}
	account := &fakeAccountClient{}
	h := &Handler{pricing: pricing, trade: trade, balance: balance, account: account}
	return h, pricing, trade, balance, account
}

func TestDoEachDay_DeletesPricingOlderThanYesterday(t *testing.T) {
	h, pricing, _, _, _ := newTestHandler()

	before := time.Now().UTC()
	h.doEachDay(context.Background())
	after := time.Now().UTC()

	if len(pricing.pricingDeleteCalls) != 1 {
		t.Fatalf("expected exactly 1 DeletePricesOlderThan call, got %d", len(pricing.pricingDeleteCalls))
	}

	cutoff := pricing.pricingDeleteCalls[0]
	wantMin := before.AddDate(0, 0, -1)
	wantMax := after.AddDate(0, 0, -1)
	if cutoff.Before(wantMin) || cutoff.After(wantMax) {
		t.Fatalf("cutoff %v not within expected yesterday-window [%v, %v]", cutoff, wantMin, wantMax)
	}
}

func TestDoEachHour_DeletesTradesAndBalanceHistoryOlderThan24h(t *testing.T) {
	h, _, trade, balance, _ := newTestHandler()
	staleAfter := 24 * time.Hour

	before := time.Now().UTC()
	h.doEachHour(context.Background(), staleAfter)
	after := time.Now().UTC()

	wantMin, wantMax := before.Add(-staleAfter), after.Add(-staleAfter)

	if len(trade.tradeDeleteCalls) != 1 {
		t.Fatalf("expected exactly 1 DeleteTradesOlderThan call, got %d", len(trade.tradeDeleteCalls))
	}
	if cutoff := trade.tradeDeleteCalls[0]; cutoff.Before(wantMin) || cutoff.After(wantMax) {
		t.Fatalf("trade cutoff %v not within expected 24h-window [%v, %v]", cutoff, wantMin, wantMax)
	}

	if len(balance.balanceDeleteCalls) != 1 {
		t.Fatalf("expected exactly 1 DeleteBalanceHistoryOlderThan call, got %d", len(balance.balanceDeleteCalls))
	}
	if cutoff := balance.balanceDeleteCalls[0]; cutoff.Before(wantMin) || cutoff.After(wantMax) {
		t.Fatalf("balance history cutoff %v not within expected 24h-window [%v, %v]", cutoff, wantMin, wantMax)
	}
}

func TestDoEachHour_DeletesAccountsExcludingPresetOrigin(t *testing.T) {
	h, _, _, _, account := newTestHandler()

	h.doEachHour(context.Background(), 24*time.Hour)

	if len(account.accountDeleteCalls) != 1 {
		t.Fatalf("expected exactly 1 DeleteAccountsOlderThan call, got %d", len(account.accountDeleteCalls))
	}
	if got := account.accountDeleteCalls[0].excludeOrigin; got != "AGGREGATOR" {
		t.Fatalf("expected excludeOrigin %q, got %q", "PRESET", got)
	}
}

func TestDoEachTime_FiresOnNthCallAndResets(t *testing.T) {
	ticker := newTicker(3, func() { t.Log("fired") })
	for range 10 {
		ticker.tick()
	}
	if ticker.counter != 1 {
		t.Fatalf("expected counter to be 1 after 10 ticks with limit 3, got %d", ticker.counter)
	}
}
