package server

import (
	"context"

	"github.com/dynatrace/easytrade/dbadapter/models"
	pb "github.com/dynatrace/easytrade/dbadapter/proto"
	"google.golang.org/protobuf/types/known/emptypb"
)

var _ pb.ProductServiceServer = (*ProductServer)(nil)

type ProductServer struct {
	pb.UnimplementedProductServiceServer
	repo models.ProductRepository
}

func NewProductServer(repo models.ProductRepository) *ProductServer {
	return &ProductServer{repo: repo}
}

func (s *ProductServer) GetProducts(ctx context.Context, _ *emptypb.Empty) (*pb.ProductsResponse, error) {
	products, err := s.repo.GetAll(ctx)
	if err != nil {
		return nil, err
	}
	return &pb.ProductsResponse{Products: mapSlice(products, toProductProto)}, nil
}

func toProductProto(p *models.Product) *pb.ProductMessage {
	return &pb.ProductMessage{
		Id:       p.ID,
		Name:     p.Name,
		Ppt:      p.Ppt,
		Currency: p.Currency,
	}
}
