FROM eclipse-temurin:21.0.7_6-jdk-alpine-3.21@sha256:8e26f8064f2b89bc8543faf43ded3f223f47dd0a7afca042fdc892f1f6a4a8c3 AS build

WORKDIR /app
# make gradlew download gradle files before copying source files to use caching
COPY ["gradle", "gradle"]
COPY ["build.gradle", "settings.gradle", "gradlew", "./"]
RUN ./gradlew dependencies

COPY ["src", "./src"]

RUN ./gradlew test fatJar

FROM eclipse-temurin:21.0.7_6-jre-alpine-3.21@sha256:7b5c88eb4182a92aab3a4b10550061a6e18639bf176e7ebca21f866b19f853c1

RUN addgroup --system --gid 3369 spring \
    && adduser --system --ingroup spring --uid 3369 spring
USER spring:spring
WORKDIR /home/spring

COPY --from=build --chown=spring:spring ["/app/build/libs/*.jar", "app.jar"]

CMD ["java", "-jar", "app.jar"]
