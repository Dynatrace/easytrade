# https://mcr.microsoft.com/v2/dotnet/sdk/tags/list
FROM mcr.microsoft.com/dotnet/sdk:8.0.404-alpine3.20@sha256:4f1ce95847c5b28f957eba8333ed4a0df87c2899c51937e2c11db22be5b46bce AS build

WORKDIR /easyTradeLoginService
COPY ["./easyTradeLoginService/", "./"]

RUN dotnet test \
    && dotnet publish -c Release -o /publish

# https://mcr.microsoft.com/v2/dotnet/aspnet/tags/list
FROM mcr.microsoft.com/dotnet/aspnet:8.0.11-alpine3.20@sha256:a0062262fd674573be2314890006acadfd233fd7fdf89b3a5f44694b7632b29e AS runtime

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

ENTRYPOINT ["dotnet", "easyTradeLoginService.dll"]
