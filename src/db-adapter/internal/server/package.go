package server

import (
	"context"

	"github.com/dynatrace/easytrade/dbadapter/internal/models"
	pb "github.com/dynatrace/easytrade/dbadapter/proto"
	"google.golang.org/protobuf/types/known/emptypb"
)

var _ pb.PackageServiceServer = (*PackageServer)(nil)

type PackageServer struct {
	pb.UnimplementedPackageServiceServer
	repo models.PackageRepository
}

func NewPackageServer(repo models.PackageRepository) *PackageServer {
	return &PackageServer{repo: repo}
}

func (s *PackageServer) GetPackages(ctx context.Context, _ *emptypb.Empty) (*pb.PackagesResponse, error) {
	packages, err := s.repo.GetAll(ctx)
	if err != nil {
		return nil, err
	}
	return &pb.PackagesResponse{Packages: mapSlice(packages, toPackageProto)}, nil
}

func toPackageProto(p *models.Package) *pb.PackageMessage {
	return &pb.PackageMessage{
		Id:      p.ID,
		Name:    p.Name,
		Price:   p.Price,
		Support: p.Support,
	}
}
