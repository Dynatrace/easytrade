#!/bin/sh
mkdir -p proto
protoc \
    --proto_path=../proto \
    --go_out=paths=source_relative:proto \
    --go-grpc_out=paths=source_relative:proto \
    ../proto/common.proto \
    ../proto/account_service.proto \
    ../proto/balance_service.proto
