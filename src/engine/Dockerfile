FROM eclipse-temurin:21.0.8_9-jdk-alpine-3.22@sha256:89517925fa675c6c4b770bee7c44d38a7763212741b0d6fca5a5103caab21a97 AS build

WORKDIR /app
# make gradlew download gradle files before copying source files to use caching
COPY ["build.gradle", "settings.gradle", "gradlew", "./"]
COPY ["gradle", "gradle"]
RUN ./gradlew dependencies

COPY ["src", "./src"]

RUN ./gradlew bootJar

FROM eclipse-temurin:21.0.8_9-jre-alpine-3.22@sha256:990397e0495ac088ab6ee3d949a2e97b715a134d8b96c561c5d130b3786a489d

RUN addgroup --system --gid 3369 spring \
    && adduser --system --ingroup spring --uid 3369 spring
USER spring:spring
WORKDIR /home/spring

COPY --from=build --chown=spring:spring ["/app/build/libs/*.jar", "app.jar"]

CMD ["java", "-jar", "app.jar"]
