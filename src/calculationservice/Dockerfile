FROM gcc:14.2.0@sha256:561e2a4b76c441215d26625fbf2d5e345da60ef22b7d46e6ab45d1d53d95c43e AS build

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

FROM ubuntu:24.04@sha256:eea047b4b181f2d3aeafbc0ce5294a2bbb3b98153a68b9ed4bc573d871ca9450

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
