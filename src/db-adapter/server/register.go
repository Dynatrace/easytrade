package server

import (
	pb "github.com/dynatrace/easytrade/dbadapter/proto"
	"github.com/dynatrace/easytrade/dbadapter/repository"
	"google.golang.org/grpc"
)

func Register(grpcServer *grpc.Server, backend repository.DBBackend) {
	pb.RegisterAccountServiceServer(grpcServer, NewAccountServer(backend.Account()))
	pb.RegisterBalanceServiceServer(grpcServer, NewBalanceServer(backend.Balance()))
	pb.RegisterCreditCardOrderServiceServer(grpcServer, NewCreditCardOrderServer(backend.CreditCard()))
	pb.RegisterPackageServiceServer(grpcServer, NewPackageServer(backend.Package()))
	pb.RegisterInstrumentServiceServer(grpcServer, NewInstrumentServer(backend.Instrument()))
	pb.RegisterPricingServiceServer(grpcServer, NewPricingServer(backend.Pricing()))
	pb.RegisterProductServiceServer(grpcServer, NewProductServer(backend.Product()))
	pb.RegisterTradeServiceServer(grpcServer, NewTradeServer(backend.Trade()))
}
