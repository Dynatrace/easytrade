#!/bin/sh
mkdir -p src/proto
protoc \
    --plugin=protoc-gen-ts_proto="$(npm root)/.bin/protoc-gen-ts_proto" \
    --ts_proto_out=src/proto \
    --ts_proto_opt=outputServices=grpc-js,esModuleInterop=true \
    --proto_path=../proto \
    --proto_path=/usr/include \
    ../proto/package_service.proto \
    ../proto/product_service.proto
