package contentcreator

import (
	"google.golang.org/grpc"

	proto "dynatrace.com/easytrade/background-service/db-adapter/proto"
)

type Handler struct {
	conn    *grpc.ClientConn
	pricing proto.PricingServiceClient
	trade   proto.TradeServiceClient
	balance proto.BalanceServiceClient
	account proto.AccountServiceClient
}

func NewHandler(conn *grpc.ClientConn) *Handler {
	return &Handler{
		conn:    conn,
		pricing: proto.NewPricingServiceClient(conn),
		trade:   proto.NewTradeServiceClient(conn),
		balance: proto.NewBalanceServiceClient(conn),
		account: proto.NewAccountServiceClient(conn),
	}
}
