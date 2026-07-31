PROTO_DIR := ../proto
PROTO_OUT := BrokerService/src/Proto
GRPC_TOOLS := $(HOME)/.nuget/packages/grpc.tools
GRPC_VERSION := $(shell ls $(GRPC_TOOLS) | sort -V | tail -1)
PROTOC := $(GRPC_TOOLS)/$(GRPC_VERSION)/tools/linux_x64/protoc
GRPC_PLUGIN := $(GRPC_TOOLS)/$(GRPC_VERSION)/tools/linux_x64/grpc_csharp_plugin
PROTOC_FLAGS := \
    --proto_path=$(PROTO_DIR) \
    --proto_path=/usr/include \
    --csharp_out=$(PROTO_OUT) \
    --grpc_out=$(PROTO_OUT) \
    --plugin=protoc-gen-grpc=$(GRPC_PLUGIN)

PROTO_FILES := \
    $(PROTO_DIR)/common.proto \
    $(PROTO_DIR)/balance_service.proto \
    $(PROTO_DIR)/instrument_service.proto \
    $(PROTO_DIR)/product_service.proto \
    $(PROTO_DIR)/trade_service.proto

.PHONY: proto build test run

proto:
	$(PROTOC) $(PROTOC_FLAGS) $(PROTO_FILES)

build:
	dotnet build BrokerService/src/BrokerService.csproj

test:
	dotnet test BrokerService/test/BrokerService.test.csproj

run:
	dotnet run --project BrokerService/src/BrokerService.csproj
