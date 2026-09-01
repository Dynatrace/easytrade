FROM golang:1.26.4-alpine3.24@sha256:3ad57304ad93bbec8548a0437ad9e06a455660655d9af011d58b993f6f615648 AS build

RUN apk add --no-cache gcc libc-dev git protoc protobuf-dev

RUN go install google.golang.org/protobuf/cmd/protoc-gen-go@latest \
    && go install google.golang.org/grpc/cmd/protoc-gen-go-grpc@latest

WORKDIR /src
COPY ["proto/", "proto/"]
COPY ["user-service/go.mod", "user-service/go.sum", "user-service/"]

WORKDIR /src/user-service
RUN go mod download \
    && go mod verify

COPY ["user-service/", "./"]

RUN PATH="$PATH:$(go env GOPATH)/bin" sh generate-proto.sh

RUN go test ./... \
    && go build -ldflags '-linkmode=external' -o user-service

FROM alpine:3.24.1@sha256:28bd5fe8b56d1bd048e5babf5b10710ebe0bae67db86916198a6eec434943f8b

RUN apk upgrade --no-cache \
    && addgroup --system --gid 3369 easytrade \
    && adduser --system --ingroup easytrade --uid 3369 easytrade
USER easytrade:easytrade
WORKDIR /home/easytrade

ENV GIN_MODE=release

COPY --from=build --chown=easytrade:easytrade ["/src/user-service/user-service", "."]

EXPOSE 8080

CMD ["./user-service"]
