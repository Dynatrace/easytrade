# Easytrade load generator

## About

Load generator for the EasyTrade app based on the implementation using Puppeteer.

## Visits:

| Name              | Description                                                                       |
| ----------------- | --------------------------------------------------------------------------------- |
| depositAndBuy     | Deposit generated value and buys random instrument                                |
| depositAndLongBuy | Deposit generated value and long buys random instrument with a generated duration |
| longSell          | Long sells held instrument with a generated duration                              |
| orderCreditCard   | Orders card for the user                                                          |
| sellAndWithdraw   | Sells and withdraw generated amount of assets                                     |

## Environment variables

This is an overview and my be out of date, check `src/config/getConifg.ts` for the current setup of env vars

- **EASYTRADE_URL**
  - > REQUIRED
  - the url to easytrade frontend, this must be a valid url (it must contain the protocol)
- **CONCURRENCY**
  - _default:_ 5
  - the number of visits running at the same time
- **BROWSERS**
  - _default:_ 1
  - the number of browsers running at the same time, this doesn't affect the **CONCURRENCY** and should generally be left at 1
- **BROWSER_TTL_MINUTES**
  - _default:_ 60
  - the time to live for browsers, since they tend to cause memory leaks when running for long periods of time restating the browsers is necessary, the time is given in minutes for convenience (to not have to do it in millis)
- **LOG_LEVEL**
  - _default:_ info
  - the log level used in the application
- **RARE_VISITS_INTERVAL_MINUTES**
  - _default:_ 60
  - how often should rare visits be run
- **HEADLESS_MODE**
  - _default:_ headless
  - one of `headless` | `headfull`
- visit data config
  - **DEPOSIT_MIN_VALUE** | **DEPOSIT_MAX_VALUE**
    - _default:_ 500 | 1500
    - when depositing money the amount will be randomly chosen from this range
  - **TRANSACTION_MIN_DURATION** | **TRANSACTION_MAX_DURATION**
    - _default:_ 1 | 24
    - when scheduling transactions the duration will be randomly chosen from this range
  - **WITHDRAW_MIN_VALUE**
    - _default:_ 500
    - the minimum amount of money that will be withdrawn
- load shape config
  - **LOAD_TYPE**
    - _default:_ NYSE
    - one of `constant` | `NYSE`
  - **NYSE_OFF_HOURS_LOAD_FACTOR**:
    - _default:_ 0.7
    - what fraction of load should be generated outside of 14:30-21:00 UTC
  - **RATE_LIMIT_TIMEFRAME_MINUTES**
    - _default:_ 5
    - the timeframe in minutes for which the generated visits are counted, too long time may cause long pauses between visits when the limit of vists in a timeframe has been reached, too short time may lead to visits lasting longer than the timeframe effectively ignoring the limit
  - **RATE_LIMIT_LEARN_TIME_FACTOR**
    - _default:_ 2
    - how many initial timeframes will the loadgen work at it's full capacity and count how many visits it can produce, after that time it will apply the defined limits (e.g. with timeframe set to 5 minuts and lear time factor set to 2 that will take 10 minutes)
- visit weights
  - the weights determine how often each visit will be run in each cycle, this is not random and each visit will be run the same amount of times each cycle, the cycle length depends on the weights and number of visits, if the weights are the same the cycle will run each visit once and repeat
  - **DEPOSIT_AND_BUY_SUCCESS_WEIGHT**
    - _default:_ 1
  - **DEPOSIT_AND_LONG_BUY_ERROR_WEIGHT**
    - _default:_ 1
  - **DEPOSIT_AND_LONG_BUY_SUCCESS_WEIGHT**
    - _default:_ 1
  - **DEPOSIT_AND_LONG_BUY_TIMEOUT_WEIGHT**
    - _default:_ 1
  - **LONG_SELL_ERROR_WEIGHT**
    - _default:_ 1
  - **LONG_SELL_SUCCESS_WEIGHT**
    - _default:_ 1
  - **LONG_SELL_TIMEOUT_WEIGHT**
    - _default:_ 1
  - **SELL_AND_WITHDRAW_SUCCESS_WEIGHT**
    - _default:_ 1

## Local usage

```bash
# Build docker image
docker build -t my-loadgen .
# Run generator
docker run -e EASYTRADE_URL={frontend-url} my-loadgen
```

## Technology

- Puppeteer
- Typescript
