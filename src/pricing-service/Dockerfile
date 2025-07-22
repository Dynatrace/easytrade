FROM golang:1.24.5-alpine3.22@sha256:daae04ebad0c21149979cd8e9db38f565ecefd8547cf4a591240dc1972cf1399 AS build

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

FROM alpine:3.22.1@sha256:4bcff63911fcb4448bd4fdacec207030997caf25e9bea4045fa6c8c44de311d1

RUN apk upgrade --no-cache \
    && addgroup --system --gid 3369 easytrade \
    && adduser --system --ingroup easytrade --uid 3369 easytrade
USER easytrade:easytrade
WORKDIR /home/easytrade

ENV GIN_MODE=release

COPY --from=build --chown=easytrade:easytrade ["/build/pricing-service", "."]

CMD ["./pricing-service"]
