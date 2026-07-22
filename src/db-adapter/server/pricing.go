package server

import (
	"context"

	"github.com/dynatrace/easytrade/dbadapter/models"
	pb "github.com/dynatrace/easytrade/dbadapter/proto"
	"google.golang.org/protobuf/types/known/emptypb"
	"google.golang.org/protobuf/types/known/timestamppb"
)

var _ pb.PricingServiceServer = (*PricingServer)(nil)

type PricingServer struct {
	pb.UnimplementedPricingServiceServer
	repo models.PricingRepository
}

func NewPricingServer(repo models.PricingRepository) *PricingServer {
	return &PricingServer{repo: repo}
}

func (s *PricingServer) GetLatestPrices(ctx context.Context, _ *emptypb.Empty) (*pb.PricesResponse, error) {
	prices, err := s.repo.GetLatest(ctx)
	if err != nil {
		return nil, err
	}
	return &pb.PricesResponse{Prices: mapSlice(prices, toPriceProto)}, nil
}

func (s *PricingServer) GetLatestPriceForInstrument(ctx context.Context, req *pb.GetLatestPriceForInstrumentRequest) (*pb.PriceMessage, error) {
	if err := validateUUID(req.InstrumentId); err != nil {
		return nil, err
	}
	p, err := s.repo.GetMostRecent(ctx, req.InstrumentId)
	return protoOrNotFound(p, err, toPriceProto)
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
	return &pb.PricesResponse{Prices: mapSlice(prices, toPriceProto)}, nil
}

func (s *PricingServer) InsertPricesBatch(ctx context.Context, req *pb.InsertPricesBatchRequest) (*pb.BatchResponse, error) {
	for _, row := range req.Rows {
		if err := validateUUID(row.InstrumentId); err != nil {
			return nil, err
		}
	}
	return batchResponse(s.repo.InsertBatch(ctx, mapSlice(req.Rows, toPriceModel)))
}

func (s *PricingServer) DeletePricesOlderThan(ctx context.Context, req *pb.DeleteBeforeRequest) (*pb.BatchResponse, error) {
	return batchResponse(s.repo.DeleteOlderThan(ctx, req.Before.AsTime()))
}

func toPriceModel(row *pb.PricingRow) *models.Price {
	return &models.Price{
		InstrumentID: row.InstrumentId,
		Timestamp:    row.Timestamp.AsTime(),
		Open:         row.Open,
		High:         row.High,
		Low:          row.Low,
		Close:        row.Close,
	}
}

func toPriceProto(p *models.Price) *pb.PriceMessage {
	return &pb.PriceMessage{
		Id:           p.ID,
		InstrumentId: p.InstrumentID,
		Timestamp:    timestamppb.New(p.Timestamp),
		Open:         p.Open,
		High:         p.High,
		Low:          p.Low,
		Close:        p.Close,
	}
}
