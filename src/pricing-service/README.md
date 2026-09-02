# easyTradePricingService

A go service that provides information about instrument prices. Pricing data is fetched from the `db-adapter` service over gRPC.

## Technologies used

- Go 1.26
- Docker
- gRPC (db-adapter)

## Local build instructions

```bash
docker build -t IMAGE_NAME .
docker run -d --name SERVICE_NAME IMAGE_NAME
```

### Run locally without Docker

```bash
sh generate-proto.sh   # regenerate gRPC stubs from src/proto/ → proto/*.pb.go (requires protoc + protoc-gen-go + protoc-gen-go-grpc)
go run .
```

`generate-proto.sh` reads `../proto/pricing_service.proto` and `../proto/common.proto` and writes generated Go files into `proto/`; re-run it whenever the shared proto files change.
