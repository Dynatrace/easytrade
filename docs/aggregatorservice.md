# easyTradeAggregatorService

A small node service that periodically asks offer service for some data. Sometimes asks to register a new user. Based on the response speed the service behavior can change a bit for some time - too slow responses "freeze" the service for some time.

## Technologies used

- Docker
- Node.js

If you want the service to work properly, you should try setting these ENV variables:

- OFFER_SERVICE - host and port of offer service, for example `offerservice:8080`
- PLATFORM - the platform represented, should be one of:
  - dynatestsieger.at
  - tradeCom.co.uk
  - CryptoTrading.com
  - CheapTrading.mi
  - Stratton-oakmount.com
- STARTER_PACKAGE_PROBABILITY - probability of selecting starter/light/pro packages. They should total to 1. For example 0.5, 0.4 and 0.1 can be the values
- LIGHT_PACKAGE_PROBABILITY - as above
- PRO_PACKAGE_PROBABILITY - as above
