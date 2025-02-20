FROM node:22.13.1-alpine3.21@sha256:e2b39f7b64281324929257d0f8004fb6cb4bf0fdfb9aa8cedb235a766aec31da AS build

WORKDIR /app

COPY [".", "."]

RUN npm install \
    # && npm run build-test \
    && npm run build

FROM nginx:1.26.3-alpine@sha256:d05f6fee67a3521d2fe000d471ac9b5af1900847f25b837e167f2213e95ddf0f

WORKDIR /app

COPY --from=build ["/app/dist", "."]

RUN rm /etc/nginx/conf.d/default.conf

COPY ["nginx.conf", "/etc/nginx/nginx.conf"]

CMD ["nginx", "-g", "daemon off;"]