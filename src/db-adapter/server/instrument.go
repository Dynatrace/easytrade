package server

import (
	"context"

	pb "github.com/dynatrace/easytrade/dbadapter/proto"
	"github.com/dynatrace/easytrade/dbadapter/repository"
	"google.golang.org/protobuf/types/known/emptypb"
)

var _ pb.InstrumentServiceServer = (*InstrumentServer)(nil)

type InstrumentServer struct {
	pb.UnimplementedInstrumentServiceServer
	repo repository.InstrumentRepository
}

func NewInstrumentServer(repo repository.InstrumentRepository) *InstrumentServer {
	return &InstrumentServer{repo: repo}
}

func (s *InstrumentServer) GetInstrumentById(ctx context.Context, req *pb.GetInstrumentRequest) (*pb.InstrumentMessage, error) {
	if err := validateUUID(req.Id); err != nil {
		return nil, err
	}
	return fetchOrNotFound(s.repo.GetByID(ctx, req.Id))
}

func (s *InstrumentServer) GetAllInstruments(ctx context.Context, _ *emptypb.Empty) (*pb.InstrumentsResponse, error) {
	instruments, err := s.repo.GetAll(ctx)
	if err != nil {
		return nil, err
	}
	return &pb.InstrumentsResponse{Instruments: instruments}, nil
}

func (s *InstrumentServer) GetOwnedInstrument(ctx context.Context, req *pb.GetOwnedInstrumentRequest) (*pb.OwnedInstrumentMessage, error) {
	if err := validateUUID(req.AccountId); err != nil {
		return nil, err
	}
	if err := validateUUID(req.InstrumentId); err != nil {
		return nil, err
	}
	return fetchOrNotFound(s.repo.GetOwned(ctx, req.AccountId, req.InstrumentId))
}

func (s *InstrumentServer) GetOwnedInstruments(ctx context.Context, req *pb.GetOwnedInstrumentsOfAccountRequest) (*pb.OwnedInstrumentsResponse, error) {
	if err := validateUUID(req.AccountId); err != nil {
		return nil, err
	}
	owned, err := s.repo.GetAllOwned(ctx, req.AccountId)
	if err != nil {
		return nil, err
	}
	return &pb.OwnedInstrumentsResponse{OwnedInstruments: owned}, nil
}

func (s *InstrumentServer) AddOwnedInstrument(ctx context.Context, req *pb.AddOwnedInstrumentRequest) (*pb.OwnedInstrumentMessage, error) {
	if err := validateUUID(req.AccountId); err != nil {
		return nil, err
	}
	if err := validateUUID(req.InstrumentId); err != nil {
		return nil, err
	}
	return s.repo.AddOwned(ctx, req)
}

func (s *InstrumentServer) UpdateOwnedInstrument(ctx context.Context, req *pb.UpdateOwnedInstrumentRequest) (*pb.OwnedInstrumentMessage, error) {
	if err := validateUUID(req.AccountId); err != nil {
		return nil, err
	}
	if err := validateUUID(req.InstrumentId); err != nil {
		return nil, err
	}
	existing, err := fetchOrNotFound(s.repo.GetOwned(ctx, req.AccountId, req.InstrumentId))
	if err != nil {
		return nil, err
	}
	existing.Quantity = req.Quantity
	existing.LastModificationDate = req.LastModificationDate
	return fetchOrNotFound(s.repo.UpdateOwned(ctx, existing))
}
