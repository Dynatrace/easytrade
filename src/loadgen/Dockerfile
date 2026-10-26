FROM node:24.22.1-trixie-slim@sha256:43b9ba1142b8dcf33fa8f922ca1be85714adc444e0586c7cf7726daaeabc1bea AS builder

WORKDIR /usr/src/app

COPY ["./", "./"]

RUN npm ci \
    && npm run build

FROM node:24.22.1-trixie-slim@sha256:43b9ba1142b8dcf33fa8f922ca1be85714adc444e0586c7cf7726daaeabc1bea AS dev

ARG CHROME_LIBS="libasound2 libatk-bridge2.0-0 libatk1.0-0 libcairo2 libcups2 libdrm-dev libgbm-dev libglib2.0-0 libnss3 libpango-1.0-0 libxcomposite1 libxdamage1 libxfixes-dev libxkbcommon-dev libxrandr-dev"

WORKDIR /usr/src/app

RUN apt update \
    && apt upgrade -y \
    && apt install -y ${CHROME_LIBS} \
    && apt install -y dumb-init \
    && apt install -y curl \
    && rm -rf /var/lib/apt/lists/*

COPY ["package.json", "package-lock.json", "./"]

RUN npm ci --omit=dev \
    && npm cache clean --force

COPY --from=builder ["/usr/src/app/build", "./build"]

ENTRYPOINT [ "/usr/bin/dumb-init", "--" ]
CMD [ "node", "./build/src/main.js" ]
