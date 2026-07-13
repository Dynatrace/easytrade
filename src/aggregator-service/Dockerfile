FROM golang:1.26.5-alpine3.24@sha256:0178a641fbb4858c5f1b48e34bdaabe0350a330a1b1149aabd498d0699ff5fb2 AS build

RUN apk add --no-cache gcc libc-dev

WORKDIR /build

COPY ["go.mod", "go.sum", "./"]

RUN go mod download

COPY [".", "."]

RUN go test ./... \
    && go build -ldflags="-linkmode=external" -o aggregator-service

FROM alpine:3.23.3@sha256:25109184c71bdad752c8312a8623239686a9a2071e8825f20acb8f2198c3f659

RUN apk upgrade --no-cache \
    && addgroup --system --gid 3369 easytrade \
    && adduser --system --ingroup easytrade --uid 3369 easytrade
USER easytrade:easytrade
WORKDIR /home/easytrade

COPY --from=build --chown=easytrade:easytrade ["/build/aggregator-service", "/build/config.yaml", "./"]

CMD [ "./aggregator-service" ]
