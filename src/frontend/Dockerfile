FROM node:22.17.1-alpine3.21@sha256:f00440c423ce5657e4d2347fa3b9bf5887389f6fcf3daa25cc79ea11a6a00f80 AS build

WORKDIR /app

COPY [".", "."]

RUN npm install \
    # && npm run build-test \
    && npm run build

FROM nginx:1.29.0-alpine3.22-slim@sha256:64daa9307345a975d3952f4252827ed4be7f03ea675ad7bb5821f75ad3d43095

WORKDIR /app

COPY --from=build ["/app/dist", "."]

COPY ["nginx.conf", "/etc/nginx/nginx.conf"]

CMD ["nginx", "-g", "daemon off;"]
