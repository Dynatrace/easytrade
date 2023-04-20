# Flagsmith

Flagsmith is a feature flag manager available across web and server side applications. It gives easyTrade ability to manage flags that trigger problem patterns

To use the functionality of Flagsmith use the GUI via: `http://{IP_ADDRESS}:8000` or via [API](https://api.flagsmith.com/api/v1/docs/)

## Techs

- Docker
- Bash
- [Flagsmith](https://docs.flagsmith.com)

## Endpoint or logic

This project has enpoints which enable to manage service over the API.
Depending on how you run flagsmith it will be available at:

```sh
//start on kubernetes
http://{IP_ADDRESS}:8000
```

## Log in

`POST` **/api/v1/auth/login/**

#### Example cURL

> ```bash
>  curl -X POST "http://{IP_ADDRESS}:8000/api/v1/auth/login/" -H  "accept: application/json" -H  "Content-Type: application/json" -d "{\"password\": \"string\",  \"email\": \"string\"}"
> ```

### Parameters

> | name       | type     | data type | description                   | default        |
> | ---------- | -------- | --------- | ----------------------------- | -------------- |
> | `email`    | required | string    | Email assigned to the user    | admin@mail.com |
> | `password` | required | string    | Password assigned to the user | adminpass123   |

The credentials provided are the default ones and should be changed.

## Get Flags

`GET` **/api/v1/flags/**

#### Example cURL

> ```bash
>  curl -X GET "http://{IP_ADDRESS}:8000/api/v1/flags/" -H  "accept: application/json" -H "X-Environment-Key {API_KEY}"
> ```

### Parameters

> | name      | type     | data type | description                 | default                |
> | --------- | -------- | --------- | --------------------------- | ---------------------- |
> | `API_KEY` | required | string    | Client side environment key | 4AYNWx8b4xjhS3Tj9axmwG |

## Enable/Disable flags

`PUT` **/api/v1/environments/{API_KEY}/featurestates/{FEATURE_ID}/**

#### Example cURL

> ```bash
>  curl -X PUT "http://{IP_ADDRESS}:8000/api/v1/environments/{API_KEY}/featurestates/{FEATURE_ID}/" -H  "accept: application/json" -H "Authorization: Token {TOKEN}" -d "{\"enabled\": true}"
> ```

To disable the flag use the same approach but with a different state to set (false).

### Parameters

> | name         | type     | data type | description                        | default                                  |
> | ------------ | -------- | --------- | ---------------------------------- | ---------------------------------------- |
> | `API_KEY`    | required | string    | Client side environment key        | 4AYNWx8b4xjhS3Tj9axmwG                   |
> | `FEATURE_ID` | required | string    | Id of the feature flag             | -                                        |
> | `TOKEN`      | required | string    | Token assigned to the user account | bd204f3b942da2a3afcf5a5835b1ed76fddb84b1 |
> | `enabled`    | required | boolean   | Is the plugin enabled or not       | -                                        |

##### Example of JSON body

> ```json
> {
>   "enabled": true
> }
> ```
