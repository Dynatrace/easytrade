package server

import (
	"context"

	"github.com/dynatrace/easytrade/dbadapter/models"
	pb "github.com/dynatrace/easytrade/dbadapter/proto"
	"google.golang.org/protobuf/types/known/emptypb"
	"google.golang.org/protobuf/types/known/timestamppb"
)

var _ pb.InstrumentServiceServer = (*InstrumentServer)(nil)

type InstrumentServer struct {
	pb.UnimplementedInstrumentServiceServer
	repo models.InstrumentRepository
}

func NewInstrumentServer(repo models.InstrumentRepository) *InstrumentServer {
	return &InstrumentServer{repo: repo}
}

func (s *InstrumentServer) GetInstrumentById(ctx context.Context, req *pb.GetInstrumentRequest) (*pb.InstrumentMessage, error) {
	if err := validateUUID(req.Id); err != nil {
		return nil, err
	}
	inst, err := s.repo.GetByID(ctx, req.Id)
	return protoOrNotFound(inst, err, toInstrumentProto)
}

func (s *InstrumentServer) GetAllInstruments(ctx context.Context, _ *emptypb.Empty) (*pb.InstrumentsResponse, error) {
	instruments, err := s.repo.GetAll(ctx)
	if err != nil {
		return nil, err
	}
	return &pb.InstrumentsResponse{Instruments: mapSlice(instruments, toInstrumentProto)}, nil
}

func (s *InstrumentServer) GetOwnedInstrument(ctx context.Context, req *pb.GetOwnedInstrumentRequest) (*pb.OwnedInstrumentMessage, error) {
	if err := validateUUID(req.AccountId); err != nil {
		return nil, err
	}
	if err := validateUUID(req.InstrumentId); err != nil {
		return nil, err
	}
	owned, err := s.repo.GetOwned(ctx, req.AccountId, req.InstrumentId)
	return protoOrNotFound(owned, err, toOwnedProto)
}

func (s *InstrumentServer) GetOwnedInstruments(ctx context.Context, req *pb.GetOwnedInstrumentsOfAccountRequest) (*pb.OwnedInstrumentsResponse, error) {
	if err := validateUUID(req.AccountId); err != nil {
		return nil, err
	}
	owned, err := s.repo.GetAllOwned(ctx, req.AccountId)
	if err != nil {
		return nil, err
	}
	return &pb.OwnedInstrumentsResponse{OwnedInstruments: mapSlice(owned, toOwnedProto)}, nil
}

func (s *InstrumentServer) AddOwnedInstrument(ctx context.Context, req *pb.AddOwnedInstrumentRequest) (*pb.OwnedInstrumentMessage, error) {
	if err := validateUUID(req.AccountId); err != nil {
		return nil, err
	}
	if err := validateUUID(req.InstrumentId); err != nil {
		return nil, err
	}
	owned, err := s.repo.AddOwned(ctx, toOwnedModel(req))
	return protoOrErr(owned, err, toOwnedProto)
}

func (s *InstrumentServer) UpdateOwnedInstrument(ctx context.Context, req *pb.UpdateOwnedInstrumentRequest) (*pb.OwnedInstrumentMessage, error) {
	if err := validateUUID(req.AccountId); err != nil {
		return nil, err
	}
	if err := validateUUID(req.InstrumentId); err != nil {
		return nil, err
	}
	owned, err := fetchOrNotFound(s.repo.GetOwned(ctx, req.AccountId, req.InstrumentId))
	if err != nil {
		return nil, err
	}
	owned.Quantity = req.Quantity
	owned.LastModificationDate = req.LastModificationDate.AsTime()
	updated, err := s.repo.UpdateOwned(ctx, owned)
	return protoOrErr(updated, err, toOwnedProto)
}

func toOwnedModel(req *pb.AddOwnedInstrumentRequest) *models.OwnedInstrument {
	return &models.OwnedInstrument{
		AccountID:            req.AccountId,
		InstrumentID:         req.InstrumentId,
		Quantity:             req.Quantity,
		LastModificationDate: req.LastModificationDate.AsTime(),
	}
}

func toInstrumentProto(inst *models.Instrument) *pb.InstrumentMessage {
	return &pb.InstrumentMessage{
		Id:          inst.ID,
		ProductId:   inst.ProductID,
		Code:        inst.Code,
		Name:        inst.Name,
		Description: inst.Description,
	}
}

func toOwnedProto(o *models.OwnedInstrument) *pb.OwnedInstrumentMessage {
	return &pb.OwnedInstrumentMessage{
		Id:                   o.ID,
		AccountId:            o.AccountID,
		InstrumentId:         o.InstrumentID,
		Quantity:             o.Quantity,
		LastModificationDate: timestamppb.New(o.LastModificationDate),
	}
}
