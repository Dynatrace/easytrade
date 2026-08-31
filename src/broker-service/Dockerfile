# https://mcr.microsoft.com/v2/dotnet/sdk/tags/list
FROM mcr.microsoft.com/dotnet/sdk:8.0.412-noble@sha256:c9a9fd6312801f4f57eb8cbb6f25c078feba76065feb2d671454dbc01c8f3601 AS build

WORKDIR /src
COPY ["proto/", "proto/"]
COPY ["broker-service/BrokerService/", "broker-service/BrokerService/"]

WORKDIR /src/broker-service/BrokerService
RUN dotnet test test/BrokerService.test.csproj \
    && dotnet publish src/BrokerService.csproj -o /publish

# https://mcr.microsoft.com/v2/dotnet/aspnet/tags/list
FROM mcr.microsoft.com/dotnet/aspnet:8.0.18-alpine3.22@sha256:a6695199ce879ae4bcfc92f3dfd55b7db5e46e3bdc128a690c6594444f0e300a AS runtime

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
