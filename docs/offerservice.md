# easyTradeOfferService

A node.js service that return information of product/package and also allows to create new users

## Technologies used

- Docker
- Node.js + express

Offer service has support for one problem pattern - ErgoAggregatorSlowdownPlugin. When this problem pattern is enabled, two of the aggregator services connected to offer service will start to get slower responses from offer service.  
Problem pattern can be enabled manually with an endpoint, or via the PluginService

## Endpoints or logic

### Problem pattern

---

Offer service has support for one problem pattern - `ergo_aggregator_slowdown`. When this problem pattern is enabled, two of the aggregator services connected to offer service will start to get slower responses from offer service.  
Problem pattern can be enabled using the api provided with the feature flag service. More information on using the feature flag service is available in the [feature flag service readme](./feature-flag-service.md).

### Endpoints

---

#### `GET` **/api/offers/{platform}** `(Get offer information of easyTrade - product and package information)`

##### Parameters

| name                 | type                | data type       | description                                |
| -------------------- | ------------------- | --------------- | ------------------------------------------ |
| `platform`           | required            | string          | What aggregator is asking for information  |
| `productFilter`      | QUERY, not required | list of strings | What type of products are we interested in |
| `maxYearlyFeeFilter` | QUERY, not required | decimal         | Maximal yearly fee of the package          |

##### Example cURL

```bash
curl -X GET 'http://{IP_ADDRESS}:8087/api/offers/CryptoTrading.com?productFilter=\[\"ETF\",\"Crypto\"\]&&maxYearlyFeeFilter=35.0' -H  "accept: text/plain"
```

---

#### `PUT` **/api/signup** `(Create new user of easyTrade)`

##### Parameters

| name             | type     | data type | description                 |
| ---------------- | -------- | --------- | --------------------------- |
| `packageId`      | required | int       | Package id                  |
| `firstName`      | required | string    | First name                  |
| `lastName`       | required | string    | Last name                   |
| `username`       | required | string    | Username                    |
| `email`          | required | string    | Email                       |
| `hashedPassword` | required | string    | Password hash               |
| `origin`         | required | DATA_TYPE | How was the account created |

##### Example cURL

```bash
curl -X PUT "http://{IP_ADDRESS}:8087/api/signup" -H  "accept: */*" -H  "Content-Type: application/json" -d '{"packageId":1,"firstName":"Jessica","lastName":"Smithin","username":"jessica_smith","email":"jessica.smith@gmail.com","hashedPassword":"139990b95cf8e8fddcb6e3202ed92a216d656a5bbe8ebb2a28bfe9911e6c3c51","origin":"PRESET"}'
```

##### Example of JSON body

```json
{
  "PackageId": 1,
  "FirstName": "Jack",
  "LastName": "Sparrow",
  "Username": "iamjack123",
  "Email": "jack@sparrow.uk",
  "HashedPassword": "30d7c7e19d829abb28abfc3878b2297794f0f538c393e6e071557b0a986754d1",
  "Origin": "dynatestsieger.at"
}
```
