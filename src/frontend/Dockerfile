FROM node:24.22.1-alpine3.23@sha256:0468540aa58203ff9e40c2aab3907c52644ab818af6176b1c70a026137dc92a2 AS build

WORKDIR /app

COPY [".", "."]

RUN npm install \
    # && npm run build-test \
    && npm run build

FROM nginx:1.29.0-alpine3.22-slim@sha256:64daa9307345a975d3952f4252827ed4be7f03ea675ad7bb5821f75ad3d43095

WORKDIR /app

COPY --from=build ["/app/dist", "."]

RUN rm /etc/nginx/conf.d/default.conf

COPY ["nginx.conf", "/etc/nginx/nginx.conf"]

CMD ["nginx", "-g", "daemon off;"]
