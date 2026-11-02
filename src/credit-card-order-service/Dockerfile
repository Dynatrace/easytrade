FROM eclipse-temurin:21.0.8_9-jdk-noble@sha256:03b731a231066bd04ada0a7ee9003cdbc1460083344f9277245b233e5ffcbf47 AS build

WORKDIR /src
COPY ["proto/common.proto", "proto/credit_card_order_service.proto", "credit-card-order-service/src/main/proto/"]
COPY ["credit-card-order-service/build.gradle", "credit-card-order-service/settings.gradle", "credit-card-order-service/gradlew", "credit-card-order-service/"]
COPY ["credit-card-order-service/gradle", "credit-card-order-service/gradle"]

WORKDIR /src/credit-card-order-service
RUN ./gradlew dependencies

COPY ["credit-card-order-service/src", "./src"]

RUN ./gradlew test bootJar

FROM eclipse-temurin:21.0.8_9-jre-alpine-3.22@sha256:990397e0495ac088ab6ee3d949a2e97b715a134d8b96c561c5d130b3786a489d

ARG GIT_COMMIT=unspecified
ENV DT_LIVEDEBUGGER_COMMIT=$GIT_COMMIT

ARG GIT_ORIGIN=unspecified
ENV DT_LIVEDEBUGGER_REMOTE_ORIGIN=$GIT_ORIGIN

RUN addgroup --system --gid 3369 easytrade \
    && adduser --system --ingroup easytrade --uid 3369 easytrade
USER easytrade:easytrade
WORKDIR /home/easytrade

COPY --from=build --chown=easytrade:easytrade ["/src/credit-card-order-service/build/libs/*.jar", "app.jar"]

CMD ["java", "-jar", "app.jar"]
