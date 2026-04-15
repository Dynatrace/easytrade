FROM mcr.microsoft.com/mssql/server:2022-CU13-ubuntu-22.04

ENV ACCEPT_EULA=Y
ENV MSSQL_PID=Express

USER root

RUN mkdir -p /my-app

WORKDIR /my-app

COPY ./sql-scripts/ /my-app
COPY ./debug/ /my-app/debug

EXPOSE 1433

ENTRYPOINT [ "./entrypoint.sh" ]
