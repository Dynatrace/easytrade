package server

import (
	"errors"

	"github.com/dynatrace/easytrade/dbadapter/repository"
	"github.com/google/uuid"
	pb "github.com/dynatrace/easytrade/dbadapter/proto"
	"google.golang.org/grpc/codes"
	"google.golang.org/grpc/status"
)

func mapSlice[T, M any](items []T, mapper func(T) M) []M {
	out := make([]M, len(items))
	for i, item := range items {
		out[i] = mapper(item)
	}
	return out
}

func protoOrErr[T, M any](entity T, err error, mapper func(T) M) (M, error) {
	if err != nil {
		var zero M
		return zero, err
	}
	return mapper(entity), nil
}

func protoOrNotFound[T, M any](entity *T, err error, mapper func(*T) M) (M, error) {
	if errors.Is(err, repository.ErrNotFound) {
		var zero M
		return zero, errNotFound()
	}
	return protoOrErr(entity, err, mapper)
}

func batchResponse(affected int32, err error) (*pb.BatchResponse, error) {
	if err != nil {
		return nil, err
	}
	return &pb.BatchResponse{Affected: affected}, nil
}

func fetchOrNotFound[T any](item *T, err error) (*T, error) {
	if errors.Is(err, repository.ErrNotFound) {
		return nil, errNotFound()
	}
	return item, err
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
