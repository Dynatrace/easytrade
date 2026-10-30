FROM golang:1.26.10-alpine3.24@sha256:a2012b4a1d1f9f7e9f44e0d39b805a901e856b1dd80b4e6ee4338db547050308 AS build

RUN apk add --no-cache gcc libc-dev git

WORKDIR /build

COPY ["go.mod", "go.sum", "./"]

RUN go mod download \
    && go mod verify

COPY [".", "."]

RUN go test ./... \
    && go build -ldflags '-linkmode=external' -o feature-flag-service .

FROM alpine:3.24.1@sha256:28bd5fe8b56d1bd048e5babf5b10710ebe0bae67db86916198a6eec434943f8b

RUN apk upgrade --no-cache \
    && addgroup --system --gid 3369 easytrade \
    && adduser --system --ingroup easytrade --uid 3369 easytrade
USER easytrade:easytrade
WORKDIR /home/easytrade

ENV GIN_MODE=release

COPY --from=build --chown=easytrade:easytrade ["/build/feature-flag-service", "."]

CMD ["./feature-flag-service"]
