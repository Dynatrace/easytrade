FROM node:24.22.1-alpine3.23@sha256:0468540aa58203ff9e40c2aab3907c52644ab818af6176b1c70a026137dc92a2 AS build

WORKDIR /app

COPY [".", "."]

RUN npm install \
    # && npm run build-test \
    && npm run build

FROM nginx:1.31.9-alpine3.24-slim@sha256:5bfced78d24d644270bedb0a9968697042e38d5c03fb6354603df025279c1cbe

WORKDIR /app

COPY --from=build ["/app/dist", "."]

RUN rm /etc/nginx/conf.d/default.conf

COPY ["nginx.conf", "/etc/nginx/nginx.conf"]

CMD ["nginx", "-g", "daemon off;"]
