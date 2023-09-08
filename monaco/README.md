# easytrade monaco configuration   
NOTE: use monaco: https://github.com/Dynatrace/dynatrace-configuration-as-code/releases/tag/v2.0.0   

# Prerequisities   
Export token as environment variable `devToken`.   

Token must have follwoing permissions:
```
settings.read,settings.write,DataExport,ReadConfig,WriteConfig
```
Example command for creating token: 
```
curl -X POST "https://<tenant_url>/api/v2/apiTokens" -H "accept: application/json; charset=utf-8" -H "Content-Type: application/json; charset=utf-8" -d "{\"name\":\"monaco2\",\"scopes\":[\"settings.read\",\"settings.write\",\"DataExport\",\"ReadConfig\",\"WriteConfig\"]}" -H "Authorization: Api-Token XXXXXXXX"
```

# Deploy configuration
```
monaco deploy manifest.yaml -v -e dev
```

# Optional: download configuration
```
monaco download --manifest manifest.yaml --environment dev -s builtin:bizevents.http.incoming
```

# Capture rule standarization

All bizevents are defined according to these rules:
- rule name: 
    - request to nginx proxy: `EasyTrade [nginx] - {HTTP method} {endpoint}`
    - request to every other service `EasyTrade [{service-name} | {technology}] - {HTTP method} {endpoint}`
- triggers: both request `HTTP method` and `path`
- event provider: `www.easytrade.com`
- event type:
    - request to nginx proxy: `com.easytrade.nginx.{name}`
    - request to every other service: `com.easytrade.{name}`
- event category: `request path`

Example:
- rule name: `EasyTrade [broker-service | .NET] - POST /v1/trade/long/buy`
- triggers: `HTTP Method equals 'POST'` and `Path starts with '/v1/trade/long/buy'` 
- event provider: `www.easytrade.com`
- event type: `com.easytrade.long-buy`
- event category: `request path` (/v1/trade/long/buy)