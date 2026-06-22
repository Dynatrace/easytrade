FROM golang:1.26.4-alpine3.24@sha256:3ad57304ad93bbec8548a0437ad9e06a455660655d9af011d58b993f6f615648 AS build

RUN apk add --no-cache gcc libc-dev git

WORKDIR /build

COPY ["go.mod", "go.sum", "./"]

RUN go mod tidy \
    && go mod verify

COPY [".", "."]

RUN go test ./... \
    && go install github.com/swaggo/swag/cmd/swag@v1.16.3 \
    && swag init \
    && go build -ldflags '-linkmode=external' -o pricing-service

FROM alpine:3.24.1@sha256:28bd5fe8b56d1bd048e5babf5b10710ebe0bae67db86916198a6eec434943f8b

RUN apk upgrade --no-cache \
    && addgroup --system --gid 3369 easytrade \
    && adduser --system --ingroup easytrade --uid 3369 easytrade
USER easytrade:easytrade
WORKDIR /home/easytrade

ENV GIN_MODE=release

COPY --from=build --chown=easytrade:easytrade ["/build/pricing-service", "."]

CMD ["./pricing-service"]
