.PHONY: proto build test tidy run

proto:
	sh generate-proto.sh

build:
	go build ./...

test:
	go test ./...

tidy:
	go mod tidy

run:
	go run .
