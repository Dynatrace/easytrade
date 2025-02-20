# PROJECT_NAME

PROJECT DESCRIPTION  
Ipsum dolor...

## Technologies used
- Tech 1
- Tech 2

## Local build instructions
```bash
docker build -t IMAGE_NAME .
docker run -d --name SERVICE_NAME IMAGE_NAME
```

If you want the service to work properly, you should try setting these ENV variables:

- SOMEVAR - wtf
- SOMEVAR - wtf

## Endpoints or logic

REMOVE BLOACK IF NOT NEEDED, ADJUST IF NEEDED
Swagger endpoint is available at:
```bash
# when deployed locally
http://localhost:SERVICE_PORT/PATH_TO_SWAGGER

# when deployed with docker-compose
http://localhost:SERVICE_PORT/PATH_TO_SWAGGER

# when deployed with k8s
http://SOMEWHERE/SERVICE_NAME/PATH_TO_SWAGGER
```

`GET/PUT/POST/DELETE` **ENDPOINT_WITH_RESPONSES** `(DESCRIPTION)`

##### Parameters

> | name    | type     | data type | description |
> | ------- | -------- | --------- | ----------- |
> | `PARAM` | required | DATA_TYPE | DESCRIPTION |

##### Responses

> | http code | content-type               | response                                 |
> | --------- | -------------------------- | ---------------------------------------- |
> | `201`     | `text/plain;charset=UTF-8` | `Configuration created successfully`     |
> | `400`     | `application/json`         | `{"code":"400","message":"Bad Request"}` |
> | `405`     | `text/html;charset=utf-8`  | None                                     |

##### Example cURL
> ```bash
>  CURL_EXAMPLE
> ```

`GET/PUT/POST/DELETE` **ENDPOINT_WITH_JSON_BODY** `(DESCRIPTION)`

##### Parameters

> | name    | type     | data type | description |
> | ------- | -------- | --------- | ----------- |
> | `PARAM` | required | DATA_TYPE | DESCRIPTION |

##### Example cURL
> ```bash
>  CURL_EXAMPLE
> ```

##### Example of JSON body

> ```json
> {
>   "SOME_NUMBER": 2,
>   "SOME_TEXT": "Hello",
>   "SOME_DATE": "2021-08-11T13:00:00",
>   "SOME_BOOL": true
> }
> ```

`GET/PUT/POST/DELETE` **PURE_ENDPOINT** `(DESCRIPTION)`

##### Parameters

> | name    | type     | data type | description |
> | ------- | -------- | --------- | ----------- |
> | `PARAM` | required | DATA_TYPE | DESCRIPTION |

##### Example cURL
> ```bash
>  CURL_EXAMPLE
> ```
