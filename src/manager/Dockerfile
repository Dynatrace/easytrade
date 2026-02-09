# https://mcr.microsoft.com/v2/dotnet/sdk/tags/list
FROM mcr.microsoft.com/dotnet/sdk:8.0.412-alpine3.22@sha256:ad6ab1a677854e5b681bc69f4fdb4ad9913e3798c4f89927254b6a53215d5b7d AS build

WORKDIR /src
COPY ["easyTradeManager.csproj", "./"]

RUN dotnet restore "easyTradeManager.csproj"

COPY [".", "."]

RUN dotnet publish "easyTradeManager.csproj" -c Release -o /publish

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

CMD ["dotnet", "easyTradeManager.dll"]
