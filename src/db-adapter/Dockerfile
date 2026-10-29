FROM golang:1.26.10-alpine3.24@sha256:a2012b4a1d1f9f7e9f44e0d39b805a901e856b1dd80b4e6ee4338db547050308 AS build

RUN apk add --no-cache gcc libc-dev git protoc protobuf-dev

RUN go install google.golang.org/protobuf/cmd/protoc-gen-go@latest \
    && go install google.golang.org/grpc/cmd/protoc-gen-go-grpc@latest

WORKDIR /src
COPY ["proto/", "proto/"]
COPY ["db-adapter/go.mod", "db-adapter/go.sum", "db-adapter/"]

WORKDIR /src/db-adapter
RUN go mod tidy \
    && go mod verify

COPY ["db-adapter/", "./"]

RUN PATH="$PATH:$(go env GOPATH)/bin" sh generate-proto.sh

RUN go test ./... \
    && go build -ldflags '-linkmode=external' -o db-adapter

FROM alpine:3.24.1@sha256:28bd5fe8b56d1bd048e5babf5b10710ebe0bae67db86916198a6eec434943f8b

RUN apk upgrade --no-cache \
    && addgroup --system --gid 3369 easytrade \
    && adduser --system --ingroup easytrade --uid 3369 easytrade
USER easytrade:easytrade
WORKDIR /home/easytrade

COPY --from=build --chown=easytrade:easytrade ["/src/db-adapter/db-adapter", "."]

EXPOSE 50051

CMD ["./db-adapter"]
