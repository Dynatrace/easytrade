PROTO_DIR := ../proto
PROTOC_GEN_TS_PROTO := ./node_modules/.bin/protoc-gen-ts_proto

.PHONY: proto build lint

node_modules: package.json package-lock.json
	npm ci

proto: node_modules
	npm run generate:proto

build:
	npm run build

lint:
	npm run lint
