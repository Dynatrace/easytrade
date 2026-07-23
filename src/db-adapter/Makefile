PROTO_DIR := ../proto
PROTOC_FLAGS := \
    --proto_path=$(PROTO_DIR) \
    --go_out=paths=source_relative:proto \
    --go-grpc_out=paths=source_relative:proto

.PHONY: proto build test tidy

proto:
	protoc $(PROTOC_FLAGS) $(PROTO_DIR)/*.proto

build:
	go build ./...

test:
	go test ./...

tidy:
	go mod tidy
