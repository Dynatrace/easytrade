package server

import (
	"errors"

	pb "github.com/dynatrace/easytrade/dbadapter/proto"
	"github.com/dynatrace/easytrade/dbadapter/repository"
	"github.com/google/uuid"
	"google.golang.org/grpc/codes"
	"google.golang.org/grpc/status"
)

func fetchOrNotFound[M any](msg M, err error) (M, error) {
	if err != nil {
		var zero M
		if errors.Is(err, repository.ErrNotFound) {
			return zero, errNotFound()
		}
		return zero, err
	}
	return msg, nil
}

func batchResponse(affected int32, err error) (*pb.BatchResponse, error) {
	if err != nil {
		return nil, err
	}
	return &pb.BatchResponse{Affected: affected}, nil
}

func errNotFound() error {
	return status.Error(codes.NotFound, "not found")
}

func validateUUID(value string) error {
	if _, err := uuid.Parse(value); err != nil {
		return status.Errorf(codes.InvalidArgument, "%q is not a valid UUID", value)
	}
	return nil
}
