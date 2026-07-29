package server

import (
	"context"

	pb "github.com/dynatrace/easytrade/dbadapter/proto"
	"github.com/dynatrace/easytrade/dbadapter/repository"
	"google.golang.org/protobuf/types/known/emptypb"
)

var _ pb.ProductServiceServer = (*ProductServer)(nil)

type ProductServer struct {
	pb.UnimplementedProductServiceServer
	repo repository.ProductRepository
}

func NewProductServer(repo repository.ProductRepository) *ProductServer {
	return &ProductServer{repo: repo}
}

func (s *ProductServer) GetProducts(ctx context.Context, _ *emptypb.Empty) (*pb.ProductsResponse, error) {
	products, err := s.repo.GetAll(ctx)
	if err != nil {
		return nil, err
	}
	return &pb.ProductsResponse{Products: products}, nil
}
