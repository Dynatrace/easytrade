FROM eclipse-temurin:21.0.5_11-jdk-noble@sha256:397ce4722066bed7fa96f171e0c3c252bf509347da854ec4e9ca5664a00038c1 AS build

WORKDIR /app
# make gradlew download gradle files before copying source files to use caching
COPY ["build.gradle", "settings.gradle", "gradlew", "./"]
COPY ["gradle", "gradle"]
RUN ./gradlew --version

COPY ["src", "./src"]

RUN ./gradlew test
RUN ./gradlew bootJar

FROM eclipse-temurin:21.0.5_11-jre-ubi9-minimal@sha256:befbafaac4c0235c68f820516ec6ec613745237139fa0283f219e3ef60d22c45

RUN groupadd --system --gid 3369 spring \
    && useradd --system --gid spring --create-home --uid 3369 spring
USER spring:spring
WORKDIR /home/spring

COPY --from=build --chown=spring:spring ["/app/build/libs/*.jar", "app.jar"]

CMD ["java", "-jar", "app.jar"]