package main

import (
	"fmt"
	"net"

	"github.com/dynatrace/easytrade/dbadapter/config"
	"github.com/dynatrace/easytrade/dbadapter/repository"
	_ "github.com/dynatrace/easytrade/dbadapter/repository/mssql"
	"github.com/dynatrace/easytrade/dbadapter/server"
	pb "github.com/dynatrace/easytrade/dbadapter/proto"
	log "github.com/sirupsen/logrus"
	"google.golang.org/grpc"
)

func main() {
	cfg := config.Load()

	repo, err := repository.Open(cfg.Database)
	if err != nil {
		log.WithError(err).Fatal("Failed to connect to database")
	}

	lis, err := net.Listen("tcp", fmt.Sprintf(":%s", cfg.Server.GRPCPort))
	if err != nil {
		log.WithError(err).Fatalf("Failed to listen on port %s", cfg.Server.GRPCPort)
	}

	grpcServer := grpc.NewServer()

	pb.RegisterAccountServiceServer(grpcServer, server.NewAccountServer(repo.Account()))
	pb.RegisterBalanceServiceServer(grpcServer, server.NewBalanceServer(repo.Balance()))
	pb.RegisterCreditCardOrderServiceServer(grpcServer, server.NewCreditCardOrderServer(repo.CreditCard()))
	pb.RegisterPackageServiceServer(grpcServer, server.NewPackageServer(repo.Package()))
	pb.RegisterInstrumentServiceServer(grpcServer, server.NewInstrumentServer(repo.Instrument()))
	pb.RegisterPricingServiceServer(grpcServer, server.NewPricingServer(repo.Pricing()))
	pb.RegisterProductServiceServer(grpcServer, server.NewProductServer(repo.Product()))
	pb.RegisterTradeServiceServer(grpcServer, server.NewTradeServer(repo.Trade()))

	log.Infof("db-adapter listening on :%s", cfg.Server.GRPCPort)
	if err := grpcServer.Serve(lis); err != nil {
		log.WithError(err).Fatal("db-adapter server failed")
	}
}
