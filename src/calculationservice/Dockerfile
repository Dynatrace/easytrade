FROM gcc:14.3.0-trixie@sha256:0bb1ad383e858a31b24ce42e152af3262d68d1679db50b9096ceb75ca0edc44f AS build

ARG C_FLAGS="-lonesdk_static -lamqpcpp -lpthread -levent -levent_core -Wl,--no-as-needed -ldl"
ARG DEBIAN_FRONTEND="noninteractive"
ARG ONEAGENT_SDK_VERSION="1.7.1"
ARG ONEAGENT_SDK_DIR="OneAgent-SDK-for-C-${ONEAGENT_SDK_VERSION}"
ARG ONEAGENT_SDK_URL="https://github.com/Dynatrace/OneAgent-SDK-for-C/archive/refs/tags/v${ONEAGENT_SDK_VERSION}.tar.gz"

RUN apt-get update \
    && apt-get install -y \
        build-essential \
        libssl-dev \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /src

RUN git clone -b v4.3.26 https://github.com/CopernicaMarketingSoftware/AMQP-CPP.git \
    && cd AMQP-CPP \
    && make \
    && make install

COPY ["conn_handler.h", "consume.cpp", "./"]

RUN wget ${ONEAGENT_SDK_URL} -O oneagentsdk.tar.gz \
    && tar -zxvf oneagentsdk.tar.gz \
    && g++ -std=c++17 -o consumeCandleData consume.cpp -I ./${ONEAGENT_SDK_DIR}/include -L ./${ONEAGENT_SDK_DIR}/lib/linux-x86_64 ${C_FLAGS}

FROM ubuntu:24.04@sha256:66460d557b25769b102175144d538d88219c077c678a49af4afca6fbfc1b5252

RUN apt-get update \
    && apt-get install -y \
        make \
        libevent-dev \
    && rm -rf /var/lib/apt/lists/* \
    && useradd --system --user-group --uid 3369 easytrade

WORKDIR /home/easytrade

RUN --mount=type=bind,from=build,source=/src/AMQP-CPP,target=./AMQP-CPP \
    cd AMQP-CPP && \
    make install

USER easytrade

COPY --from=build --chown=easytrade:easytrade ["/src/consumeCandleData", "."]
COPY --chown=easytrade:easytrade ["entrypoint.sh", "."]

CMD ["./entrypoint.sh"]
