FROM node:24.11.0-alpine3.22@sha256:f36fed0b2129a8492535e2853c64fbdbd2d29dc1219ee3217023ca48aebd3787 AS build

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
