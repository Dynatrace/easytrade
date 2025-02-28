FROM eclipse-temurin:21.0.5_11-jdk-alpine@sha256:4909fb9ab52e3ce1488cc6e6063da71a0f9f9833420cc254fe03bbe25daec9e0 AS build

WORKDIR /app
# make gradlew download gradle files before copying source files to use caching
COPY ["gradle", "gradle"]
COPY ["build.gradle", "settings.gradle", "gradlew", "./"]
RUN ./gradlew --version

COPY ["src", "./src"]

RUN ./gradlew bootJar

FROM eclipse-temurin:21.0.5_11-jre-alpine@sha256:2a0bbb1db6d8db42c66ed00c43d954cf458066cc37be12b55144781da7864fdf

RUN addgroup --system --gid 3369 spring \
    && adduser --system --ingroup spring --uid 3369 spring
USER spring:spring
WORKDIR /home/spring

COPY --from=build --chown=spring:spring ["/app/build/libs/*.jar", "app.jar"]

CMD ["java", "-jar", "app.jar"]