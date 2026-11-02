# EasyTrade

EasyTrade is a fake stock-broking application. Users sign up, deposit money, and buy
and sell instruments whose prices and market activity are generated synthetically. None of the data is
real. The application produces continuous microservice traffic, and can **break that
traffic on demand** through a set of reversible problem patterns.

## Start here

| If you want to…                                               | Read                                          |
| ------------------------------------------------------------- | --------------------------------------------- |
| Understand the failure scenarios EasyTrade can simulate       | [Problem patterns](problem-patterns/index.md) |
| Know what each service is written in and how it fits together | [Technology stack](technology-stack/index.md) |

## The application in one paragraph

Twelve services in four languages sit behind a single nginx reverse proxy on port 80.
The React frontend and every backend API are reachable under that one origin. No service
talks to the database directly: all persistence goes through **db-adapter**, a Go gRPC
service that fronts Postgres, MSSQL, or any other dialect its backend supports. Traffic never stops, because
**background-service** continuously simulates external trading platforms polling for
offers, generates price candles, and drives credit-card manufacture and delivery, while
**loadgen** drives the public HTTP endpoints. A dedicated **feature-flag-service** holds
the switches that turn each problem pattern on and off.
