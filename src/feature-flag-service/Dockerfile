FROM golang:1.26.4-alpine3.24@sha256:3ad57304ad93bbec8548a0437ad9e06a455660655d9af011d58b993f6f615648 AS build

RUN apk add --no-cache gcc libc-dev git

WORKDIR /build

COPY ["go.mod", "go.sum", "./"]

RUN go mod download \
    && go mod verify

COPY [".", "."]

ARG BUILD_VERSION=dev
ARG BUILD_DATE=unknown
ARG BUILD_COMMIT=unknown

RUN go install github.com/swaggo/swag/cmd/swag@v1.16.3 \
    && swag init \
    && go test ./... \
    && go build \
        -ldflags "-linkmode=external \
                  -X dynatrace.com/easytrade/feature-flag-service/version.BuildVersion=${BUILD_VERSION} \
                  -X dynatrace.com/easytrade/feature-flag-service/version.BuildDate=${BUILD_DATE} \
                  -X dynatrace.com/easytrade/feature-flag-service/version.BuildCommit=${BUILD_COMMIT}" \
        -o feature-flag-service .

FROM alpine:3.24.1@sha256:28bd5fe8b56d1bd048e5babf5b10710ebe0bae67db86916198a6eec434943f8b

RUN apk upgrade --no-cache \
    && addgroup --system --gid 3369 easytrade \
    && adduser --system --ingroup easytrade --uid 3369 easytrade
USER easytrade:easytrade
WORKDIR /home/easytrade

ENV GIN_MODE=release

COPY --from=build --chown=easytrade:easytrade ["/build/feature-flag-service", "."]

CMD ["./feature-flag-service"]
