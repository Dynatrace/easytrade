package main

import (
	"fmt"
	"net"

	"github.com/dynatrace/easytrade/dbadapter/config"
	"github.com/dynatrace/easytrade/dbadapter/server"
	log "github.com/sirupsen/logrus"
	"google.golang.org/grpc"
)

func main() {
	cfg := config.Load()

	backend, err := newDBBackend(cfg.Database)
	if err != nil {
		log.WithError(err).Fatal("Failed to open database backend")
	}

	lis, err := net.Listen("tcp", fmt.Sprintf(":%s", cfg.Server.GRPCPort))
	if err != nil {
		log.WithError(err).Fatalf("Failed to listen on port %s", cfg.Server.GRPCPort)
	}

	grpcServer := grpc.NewServer()
	server.Register(grpcServer, backend)

	log.Infof("db-adapter listening on :%s", cfg.Server.GRPCPort)
	if err := grpcServer.Serve(lis); err != nil {
		log.WithError(err).Fatal("db-adapter server failed")
	}
}
