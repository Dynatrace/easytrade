FROM node:22.17.1-alpine3.21@sha256:f00440c423ce5657e4d2347fa3b9bf5887389f6fcf3daa25cc79ea11a6a00f80 AS build

WORKDIR /app

COPY ["*.json", "./"]
COPY ["./src", "./src"]

RUN npm ci \
    && npm run build

FROM node:22.17.1-alpine3.21@sha256:f00440c423ce5657e4d2347fa3b9bf5887389f6fcf3daa25cc79ea11a6a00f80 AS dev

RUN apk upgrade --no-cache \
    && addgroup --system --gid 3369 easytrade \
    && adduser --system --ingroup easytrade --uid 3369 easytrade
USER easytrade:easytrade
WORKDIR /home/easytrade

COPY --chown=easytrade:easytrade ["package.json", "package-lock.json", "./"]

RUN npm ci --omit=dev \
    && npm cache clean --force

COPY --chown=easytrade:easytrade --from=build ["app/dist", "./dist"]

CMD [ "node", "./dist/src/app.js" ]
