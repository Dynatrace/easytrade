package server

import (
	"google.golang.org/grpc/codes"
	"google.golang.org/grpc/status"

	pb "github.com/dynatrace/easytrade/dbadapter/proto"
)

func mapSlice[T, M any](items []T, conv func(T) M) []M {
	msgs := make([]M, len(items))
	for i, it := range items {
		msgs[i] = conv(it)
	}
	return msgs
}

func protoOrErr[T, M any](item T, err error, conv func(T) M) (M, error) {
	if err != nil {
		var zero M
		return zero, err
	}
	return conv(item), nil
}

func protoOrNotFound[T, M any](item *T, err error, conv func(*T) M) (M, error) {
	if err != nil {
		var zero M
		return zero, err
	}
	if item == nil {
		var zero M
		return zero, errNotFound()
	}
	return conv(item), nil
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
