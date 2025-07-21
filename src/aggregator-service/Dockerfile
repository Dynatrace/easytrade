FROM golang:1.24.5-alpine3.22@sha256:48ee313931980110b5a91bbe04abdf640b9a67ca5dea3a620f01bacf50593396 AS build

RUN apk add --no-cache gcc libc-dev

WORKDIR /build

COPY ["go.mod", "go.sum", "./"]

RUN go mod download

COPY [".", "."]

RUN go test ./... \
    && go build -ldflags="-linkmode=external" -o aggregator-service

FROM alpine:3.22.1@sha256:4bcff63911fcb4448bd4fdacec207030997caf25e9bea4045fa6c8c44de311d1

RUN apk upgrade --no-cache \
    && addgroup --system --gid 3369 easytrade \
    && adduser --system --ingroup easytrade --uid 3369 easytrade
USER easytrade:easytrade
WORKDIR /home/easytrade

COPY --from=build --chown=easytrade:easytrade ["/build/aggregator-service", "/build/config.yaml", "./"]

CMD [ "./aggregator-service" ]
