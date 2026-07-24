package repository

import (
	"context"
	"time"

	pb "github.com/dynatrace/easytrade/dbadapter/proto"
)

type AccountRepository interface {
	Create(ctx context.Context, req *pb.CreateAccountRequest) (*pb.AccountMessage, error)
	GetByID(ctx context.Context, id string) (*pb.AccountMessage, error)
	GetByUsername(ctx context.Context, username string) (*pb.AccountMessage, error)
	GetAll(ctx context.Context) ([]*pb.AccountMessage, error)
	DeleteOlderThan(ctx context.Context, before *time.Time, origin string) (int32, error)
}

type BalanceRepository interface {
	Create(ctx context.Context, req *pb.CreateBalanceRequest) (*pb.BalanceMessage, error)
	GetByAccountID(ctx context.Context, accountID string) (*pb.BalanceMessage, error)
	Update(ctx context.Context, msg *pb.BalanceMessage) (*pb.BalanceMessage, error)
	AddHistory(ctx context.Context, req *pb.AddBalanceHistoryRequest) (*pb.BalanceHistoryMessage, error)
	DeleteHistoryOlderThan(ctx context.Context, date time.Time) (int32, error)
}

type CreditCardOrderRepository interface {
	Create(ctx context.Context, req *pb.CreateCreditCardOrderRequest) (*pb.CreditCardOrderMessage, error)
	GetByID(ctx context.Context, id string) (*pb.CreditCardOrderMessage, error)
	GetShippingAddress(ctx context.Context, orderID string) (*pb.ShippingAddressMessage, error)
	GetStatusListByAccountID(ctx context.Context, accountID string) ([]*pb.CreditCardOrderStatusMessage, error)
	GetLastStatusByAccountID(ctx context.Context, accountID string) (*pb.CreditCardOrderStatusMessage, error)
	GetOrdersToManufacture(ctx context.Context) ([]*pb.CreditCardManufactureDataMessage, error)
	InsertStatus(ctx context.Context, req *pb.InsertNewStatusRequest) (*pb.CreditCardOrderStatusMessage, error)
	InsertCard(ctx context.Context, req *pb.InsertNewCreditCardRequest) (*pb.CreditCardMessage, error)
	Update(ctx context.Context, msg *pb.CreditCardOrderMessage) (*pb.CreditCardOrderMessage, error)
	DeleteByAccountID(ctx context.Context, accountID string) (int32, error)
}

type InstrumentRepository interface {
	GetByID(ctx context.Context, id string) (*pb.InstrumentMessage, error)
	GetAll(ctx context.Context) ([]*pb.InstrumentMessage, error)
	GetOwned(ctx context.Context, accountID, instrumentID string) (*pb.OwnedInstrumentMessage, error)
	GetAllOwned(ctx context.Context, accountID string) ([]*pb.OwnedInstrumentMessage, error)
	AddOwned(ctx context.Context, req *pb.AddOwnedInstrumentRequest) (*pb.OwnedInstrumentMessage, error)
	UpdateOwned(ctx context.Context, msg *pb.OwnedInstrumentMessage) (*pb.OwnedInstrumentMessage, error)
}

type PackageRepository interface {
	GetAll(ctx context.Context) ([]*pb.PackageMessage, error)
}

type PricingRepository interface {
	GetLatest(ctx context.Context) ([]*pb.PriceMessage, error)
	GetMostRecent(ctx context.Context, instrumentID string) (*pb.PriceMessage, error)
	GetForInstrument(ctx context.Context, instrumentID string, limit *int) ([]*pb.PriceMessage, error)
	InsertBatch(ctx context.Context, req *pb.InsertPricesBatchRequest) (int32, error)
	DeleteOlderThan(ctx context.Context, date time.Time) (int32, error)
}

type ProductRepository interface {
	GetAll(ctx context.Context) ([]*pb.ProductMessage, error)
}

type TradeRepository interface {
	Create(ctx context.Context, req *pb.CreateTradeRequest) (*pb.TradeMessage, error)
	GetByID(ctx context.Context, id string) (*pb.TradeMessage, error)
	Update(ctx context.Context, msg *pb.TradeMessage) (*pb.TradeMessage, error)
	GetOpen(ctx context.Context) ([]*pb.TradeMessage, error)
	GetExpired(ctx context.Context) ([]*pb.TradeMessage, error)
	GetByAccount(ctx context.Context, accountID string, onlyOpen, onlyLong bool) ([]*pb.TradeMessage, error)
	DeleteOlderThan(ctx context.Context, date time.Time) (int32, error)
}
