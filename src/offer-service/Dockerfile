FROM node:24.22.1-alpine3.23@sha256:0468540aa58203ff9e40c2aab3907c52644ab818af6176b1c70a026137dc92a2 AS build

RUN apk add --no-cache protoc protobuf-dev

WORKDIR /src
COPY ["proto/", "proto/"]
COPY ["offer-service/*.json", "offer-service/generate-proto.sh", "offer-service/"]
COPY ["offer-service/src", "offer-service/src"]

WORKDIR /src/offer-service
RUN npm ci \
    && npm run build

FROM node:24.22.1-alpine3.23@sha256:0468540aa58203ff9e40c2aab3907c52644ab818af6176b1c70a026137dc92a2 AS dev

RUN apk upgrade --no-cache \
    && addgroup --system --gid 3369 easytrade \
    && adduser --system --ingroup easytrade --uid 3369 easytrade
USER easytrade:easytrade
WORKDIR /home/easytrade

COPY --chown=easytrade:easytrade ["offer-service/package.json", "offer-service/package-lock.json", "./"]

RUN npm ci --omit=dev \
    && npm cache clean --force

COPY --chown=easytrade:easytrade --from=build ["/src/offer-service/dist", "./dist"]

CMD [ "node", "./dist/src/app.js" ]
