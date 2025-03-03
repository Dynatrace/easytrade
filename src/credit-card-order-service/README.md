# easyTradeCreditCardOrderService

A java service that lets the user order/remove a credit card for their account. All the manufacturing and delivery will be handled by an unmonitored third party service. The card information is stored in the database.

## Technologies used

- Java 21
- Docker
- MSSql

## Endpoints or logic

### Swagger

---

Swagger endpoint is available at:

```bash
# when deployed with k8s
http://SOMEWHERE/credit-card-order-service/swagger-ui/index.html
```

### Api v1

---

#### `POST` **/v1/orders** `(Creates a new credit card order)`

##### Parameters

| name              | type     | data type | description                                         |
| ----------------- | -------- | --------- | --------------------------------------------------- |
| `accountId`       | required | int       | Account for which we create a credit card           |
| `email`           | required | string    | Email to which notifications can be sent            |
| `name`            | required | string    | Name to be printed on the card                      |
| `shippingAddress` | required | string    | Address where the finished card will be shipped     |
| `cardLevel`       | required | string    | Type of card. Can be one of: silver, gold, platinum |

##### Example cURL

```bash
curl -X 'POST' \
'http://{IP_ADDRESS}/credit-card-order-service/v1/orders' \
-H 'accept: application/json' \
-H 'Content-Type: application/json' \
-d '{
    "accountId": 15,
    "email": "whatever@pear.com",
    "name": "John Bear",
    "shippingAddress": "Milky Way 13",
    "cardLevel": "silver"
}'
```

##### Example of JSON body

```json
{
  "accountId": 15,
  "email": "whatever@pear.com",
  "name": "John Bear",
  "shippingAddress": "Milky Way 13",
  "cardLevel": "silver"
}
```

---

#### `POST` **/v1/orders/{orderId}/status** `(Update the credit card order status)`

##### Parameters

| name        | type     | data type     | description                                               |
| ----------- | -------- | ------------- | --------------------------------------------------------- |
| `orderId`   | required | string - GUID | The ID of the credit card order                           |
| `type`      | required | string        | Type of status update                                     |
| `timestamp` | required | timestamp     | Date and time timestamp                                   |
| `details`   | optional | a JSON object | Necessary details for the operation - depends on the type |

##### Example cURL

```bash
curl -X 'POST' \
'http://{IP_ADDRESS}/credit-card-order-service/v1/orders/b0404285-41ca-4748-a8d9-8a104a0a9d08/status' \
-H 'accept: application/json' \
-H 'Content-Type: application/json' \
-d '{
    "orderId": "b0404285-41ca-4748-a8d9-8a104a0a9d08",
    "type": "card_delivered",
    "timestamp": "2023-07-28T14:51:59.847Z",
    "details": {}
}'
```

##### Example of JSON body

```json
{
  "orderId": "b0404285-41ca-4748-a8d9-8a104a0a9d08",
  "type": "card_delivered",
  "timestamp": "2023-07-28T14:51:59.847Z",
  "details": {}
}
```

---

#### `GET` **/v1/orders/{orderId}/shipping-address** `(Get shipping address of gives credit card order by its ID)`

##### Parameters

| name      | type     | data type     | description                     |
| --------- | -------- | ------------- | ------------------------------- |
| `orderId` | required | string - GUID | The ID of the credit card order |

##### Example cURL

```bash
curl -X 'GET' \
'http://{IP_ADDRESS}/credit-card-order-service/v1/orders/b0404285-41ca-4748-a8d9-8a104a0a9d08/shipping-address' \
-H 'accept: application/json'
```

---

#### `GET` **/v1/orders/{accountId}/status** `(Get the status history of credit card order by account ID)`

##### Parameters

| name        | type     | data type | description           |
| ----------- | -------- | --------- | --------------------- |
| `accountId` | required | int       | The ID of the account |

##### Example cURL

```bash
curl -X 'GET' \
'http://{IP_ADDRESS}/credit-card-order-service/v1/orders/17/status' \
-H 'accept: application/json'
```

---

#### `GET` **/v1/orders/{accountId}/status/latest** `(Get the latest status of credit card order by account ID)`

##### Parameters

| name        | type     | data type | description           |
| ----------- | -------- | --------- | --------------------- |
| `accountId` | required | int       | The ID of the account |

##### Example cURL

```bash
curl -X 'GET' \
'http://{IP_ADDRESS}/credit-card-order-service/v1/orders/17/status/latest' \
-H 'accept: application/json'
```

---

#### `DELETE` **/v1/orders/{accountId}** `(Delete the credit card order by account ID)`

##### Parameters

| name        | type     | data type | description           |
| ----------- | -------- | --------- | --------------------- |
| `accountId` | required | int       | The ID of the account |

##### Example cURL

```bash
curl -X 'DELETE' \
'http://{IP_ADDRESS}/credit-card-order-service/v1/orders/17' \
-H 'accept: application/json'
```
