# https://mcr.microsoft.com/v2/dotnet/sdk/tags/list
FROM mcr.microsoft.com/dotnet/sdk:10.0.403-noble@sha256:de4fe90a98845d75910b9769662465c84de1a934665c431279d1382b2bddc02b AS build

WORKDIR /src
COPY ["proto/", "proto/"]
COPY ["broker-service/", "broker-service/"]

WORKDIR /src/broker-service
RUN dotnet test test/BrokerService.test.csproj \
    && dotnet publish src/BrokerService.csproj -o /publish

# https://mcr.microsoft.com/v2/dotnet/aspnet/tags/list
FROM mcr.microsoft.com/dotnet/aspnet:10.0.14-alpine3.24@sha256:254fe017495996d3abcc487ffacdcce2b73affb380d3af87af12c8dff41fe0b0 AS runtime

# fix a problem with inotify instance limit
# https://stackoverflow.com/a/67111195
ENV DOTNET_HOSTBUILDER__RELOADCONFIGONCHANGE=false

RUN apk add --no-cache icu-libs \
    && apk upgrade --no-cache \
    && addgroup --system --gid 3369 easytrade \
    && adduser --system --ingroup easytrade --uid 3369 easytrade
USER easytrade:easytrade
WORKDIR /home/easytrade

COPY --from=build --chown=easytrade:easytrade ["/publish", "./"]

ENV ASPNETCORE_ENVIRONMENT=Development
ENV DOTNET_SYSTEM_GLOBALIZATION_INVARIANT=false

ENTRYPOINT ["dotnet", "BrokerService.dll"]
