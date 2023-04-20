# easytrade monaco configuration   
NOTE: use monaco2: https://github.com/Dynatrace/dynatrace-configuration-as-code/releases/tag/v2.0.0   

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
monaco download --manifest manifest.yaml --environment qna -s builtin:bizevents.http.incoming
```
