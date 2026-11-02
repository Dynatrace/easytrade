package server

import (
	"context"

	pb "github.com/dynatrace/easytrade/dbadapter/proto"
	"github.com/dynatrace/easytrade/dbadapter/repository"
	"google.golang.org/protobuf/types/known/emptypb"
)

var _ pb.PackageServiceServer = (*PackageServer)(nil)

type PackageServer struct {
	pb.UnimplementedPackageServiceServer
	repo repository.PackageRepository
}

func NewPackageServer(repo repository.PackageRepository) *PackageServer {
	return &PackageServer{repo: repo}
}

func (s *PackageServer) GetPackages(ctx context.Context, _ *emptypb.Empty) (*pb.PackagesResponse, error) {
	packages, err := s.repo.GetAll(ctx)
	if err != nil {
		return nil, err
	}
	return &pb.PackagesResponse{Packages: packages}, nil
}
