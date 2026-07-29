package server

import (
	"context"

	pb "github.com/dynatrace/easytrade/dbadapter/proto"
	"github.com/dynatrace/easytrade/dbadapter/repository"
	"google.golang.org/protobuf/types/known/emptypb"
)

var _ pb.PricingServiceServer = (*PricingServer)(nil)

type PricingServer struct {
	pb.UnimplementedPricingServiceServer
	repo repository.PricingRepository
}

func NewPricingServer(repo repository.PricingRepository) *PricingServer {
	return &PricingServer{repo: repo}
}

func (s *PricingServer) GetLatestPrices(ctx context.Context, _ *emptypb.Empty) (*pb.PricesResponse, error) {
	prices, err := s.repo.GetLatest(ctx)
	if err != nil {
		return nil, err
	}
	return &pb.PricesResponse{Prices: prices}, nil
}

func (s *PricingServer) GetLatestPriceForInstrument(ctx context.Context, req *pb.GetLatestPriceForInstrumentRequest) (*pb.PriceMessage, error) {
	if err := validateUUID(req.InstrumentId); err != nil {
		return nil, err
	}
	return fetchOrNotFound(s.repo.GetMostRecent(ctx, req.InstrumentId))
}

func (s *PricingServer) GetPricesForInstrument(ctx context.Context, req *pb.GetPricesForInstrumentRequest) (*pb.PricesResponse, error) {
	if err := validateUUID(req.InstrumentId); err != nil {
		return nil, err
	}
	var limit *int
	if req.Limit != nil {
		v := int(*req.Limit)
		limit = &v
	}
	prices, err := s.repo.GetForInstrument(ctx, req.InstrumentId, limit)
	if err != nil {
		return nil, err
	}
	return &pb.PricesResponse{Prices: prices}, nil
}

func (s *PricingServer) InsertPricesBatch(ctx context.Context, req *pb.InsertPricesBatchRequest) (*pb.BatchResponse, error) {
	for _, row := range req.Rows {
		if err := validateUUID(row.InstrumentId); err != nil {
			return nil, err
		}
	}
	return batchResponse(s.repo.InsertBatch(ctx, req))
}

func (s *PricingServer) DeletePricesOlderThan(ctx context.Context, req *pb.DeleteBeforeRequest) (*pb.BatchResponse, error) {
	return batchResponse(s.repo.DeleteOlderThan(ctx, req.Before.AsTime()))
}
