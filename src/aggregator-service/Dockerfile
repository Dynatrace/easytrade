FROM golang:1.23.4-alpine3.20@sha256:6a84ccdb73e005d0ee7bfff6066f230612ca9dff3e88e31bfc752523c3a271f8 AS build

RUN apk add --no-cache gcc libc-dev

WORKDIR /build

COPY ["go.mod", "go.sum", "./"]

RUN go mod download

COPY [".", "."]

RUN go test ./... \
    && go build -ldflags="-linkmode=external" -o aggregator-service

FROM alpine:3.20.3@sha256:1e42bbe2508154c9126d48c2b8a75420c3544343bf86fd041fb7527e017a4b4a

RUN apk upgrade --no-cache \
    && addgroup --system --gid 3369 easytrade \
    && adduser --system --ingroup easytrade --uid 3369 easytrade
USER easytrade:easytrade
WORKDIR /home/easytrade

COPY --from=build --chown=easytrade:easytrade ["/build/aggregator-service", "/build/config.yaml", "./"]

CMD [ "./aggregator-service" ]