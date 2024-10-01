# easyTradeAggregatorService

Golang service simulating many aggregators. Each platform fetches data from the offer service. If the response time is too high, the can pause their work. Platforms also signs up new users periodically.

## Technologies used

- Go
- Docker

## Configuration

This service can be configured with a YAML file. Default location is `/app/config.yaml`. You can mount your own file to the container.

### `config.yaml` structure

```yaml
offerservice: # (optional, can be overridden by environment variable)
  protocol: "http" # protocol used to communicate with the offer service
  host: "offerservice" # hostname of the offer service
  port: "8080" # port of the offer service

defaults: # default values for platforms (optional)
  delay: "3s" # time between request sent to offer service
  failDelay: "15m" # timeout after exceeding consecutive failure limit
  requestTimeLimit: "1s" # request response time limit
  signupInterval: "1h" # time between user sign ups
  consecutiveFailLimit: 50 # how many consecutive failures should appear before pausing

platforms: # sequence of platforms
  - name: "dynatestsieger.at" # name of the platform
    packageProbability:
      starter: 0.6 # probability of signing up with the starter package
      light:   0.3 # probability of the starter package
      pro:     0.1 # probability of the starter package

    #Optionals (if default values are configured):
    delay: "3s" # time between request sent to offer service
    failDelay: "15m" # timeout after exceeding consecutive failure limit
    requestTimeLimit: "1s" # request response time limit
    signupInterval: "1h" # time between user sign ups
    consecutiveFailLimit: 50 # how many consecutive failures should appear before pausing
```

Moreover, you can override the Offer Service connection configuration with these environment variables.

| Name                   | Description                                         | Default      |
| ---------------------- | --------------------------------------------------- | ------------ |
| OFFER_SERVICE_PROTOCOL | Protocol used to communicate with the offer service | http         |
| OFFER_SERVICE_HOST     | Hostname of the offer service                       | offerservice |
| OFFER_SERVICE_PORT     | Port of the offer service                           | 8080         |
