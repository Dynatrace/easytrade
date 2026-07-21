package server

import (
	"google.golang.org/grpc/codes"
	"google.golang.org/grpc/status"

	pb "github.com/dynatrace/easytrade/dbadapter/proto"
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
	if err != nil {
		var zero M
		return zero, err
	}
	if entity == nil {
		var zero M
		return zero, errNotFound()
	}
	return mapper(entity), nil
}

func batchResponse(affected int32, err error) (*pb.BatchResponse, error) {
	if err != nil {
		return nil, err
	}
	return &pb.BatchResponse{Affected: affected}, nil
}

func fetchOrNotFound[T any](item *T, err error) (*T, error) {
	if err != nil {
		return nil, err
	}
	if item == nil {
		return nil, errNotFound()
	}
	return item, nil
}

func errNotFound() error {
	return status.Error(codes.NotFound, "not found")
}
