# easyTradePricingService

A go service that provides information about instrument prices. Pricing data is fetched from the `db-adapter` service over gRPC.

## Technologies used

- Go 1.26.4
- Docker
- gRPC (db-adapter)

## Local build instructions

From the repository root:

```bash
make build services=pricing-service      # build the image from local source
make redeploy services=pricing-service   # rebuild and recreate it in the running stack
```

`make` handles the build context and the shared `src/proto/` definitions for you. Run
`make help` for every target.

### Run locally without Docker

```bash
sh generate-proto.sh   # regenerate gRPC stubs from src/proto/ → proto/*.pb.go (requires protoc + protoc-gen-go + protoc-gen-go-grpc)
go run .
```

`generate-proto.sh` reads `../proto/pricing_service.proto` and `../proto/common.proto` and writes generated Go files into `proto/`; re-run it whenever the shared proto files change.

## Endpoints

See [`pricing-service.http`](pricing-service.http) for the full request collection - run it
straight from your editor. Plus `/version`, `/livez` and `/readyz`.
