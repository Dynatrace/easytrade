import { EnvConfig } from "@demoability/loadgen-core"
import { Config, HEADLESS_MODES, ProviderConfig } from "./types"

function getProviderConfig(): ProviderConfig {
    const providerType = EnvConfig.ensureEnum(
        "LOAD_TYPE",
        ["constant", "NYSE"],
        "NYSE"
    )
    switch (providerType) {
        case "constant":
            return { type: "constant" }
        case "NYSE":
            return {
                type: "NYSE",
                learnTimeFactor: EnvConfig.ensureNumber(
                    "RATE_LIMIT_LEARN_TIME_FACTOR",
                    2
                ),
                offHoursLoadFactor: EnvConfig.ensureNumber(
                    "NYSE_OFFHOURS_LOAD_FACTOR",
                    0.7
                ),
                timeframeMinutes: EnvConfig.ensureNumber(
                    "RATE_LIMIT_TIMEFRAME_MINUTES",
                    5
                ),
            }
    }
}

export function getConfig(): Config {
    return {
        concurrent_visits: EnvConfig.ensureNumber("CONCURRENCY", 5),
        concurrent_browsers: EnvConfig.ensureNumber("BROWSERS", 1),
        browserTimeToLiveMinutes: EnvConfig.ensureNumber(
            "BROWSER_TTL_MINUTES",
            60
        ),
        logLevel: EnvConfig.ensureEnum(
            "LOG_LEVEL",
            ["silly", "debug", "verbose", "http", "info", "warn", "error"],
            "info"
        ),
        rareVisitsIntervalMinutes: EnvConfig.ensureNumber(
            "RARE_VISITS_INTERVAL_MINUTES",
            30
        ),
        headlessMode: EnvConfig.ensureEnum(
            "HEADLESS_MODE",
            HEADLESS_MODES,
            "headless"
        ),
        visitsConfig: {
            depositMinValue: EnvConfig.ensureNumber("DEPOSIT_MIN_VALUE", 500),
            depositMaxValue: EnvConfig.ensureNumber("DEPOSIT_MAX_VALUE", 1500),
            assetSellRatio: EnvConfig.ensureNumber("ASSET_SELL_RATIO", 0.1),
            withdrawMinValue: EnvConfig.ensureNumber("WITHDRAW_MIN_VALUE", 500),
            transactionMinDuration: EnvConfig.ensureNumber(
                "TRANSACTION_MIN_DURATION",
                1
            ),
            transactionMaxDuration: EnvConfig.ensureNumber(
                "TRANSACTION_MAX_DURATION",
                24
            ),
            easytradeUrl: EnvConfig.ensureUrl("EASYTRADE_URL"),
        },
        providerConfig: getProviderConfig(),
        regularVisitsWeights: {
            deposit_and_buy_success: EnvConfig.ensureNumber(
                "DEPOSIT_AND_BUY_SUCCESS_WEIGHT",
                1
            ),
            deposit_and_long_buy_error: EnvConfig.ensureNumber(
                "DEPOSIT_AND_LONG_BUY_ERROR_WEIGHT",
                1
            ),
            deposit_and_long_buy_success: EnvConfig.ensureNumber(
                "DEPOSIT_AND_LONG_BUY_SUCCESS_WEIGHT",
                1
            ),
            deposit_and_long_buy_timeout: EnvConfig.ensureNumber(
                "DEPOSIT_AND_LONG_BUY_TIMEOUT_WEIGHT",
                1
            ),
            long_sell_error: EnvConfig.ensureNumber(
                "LONG_SELL_ERROR_WEIGHT",
                1
            ),
            long_sell_success: EnvConfig.ensureNumber(
                "LONG_SELL_SUCCESS_WEIGHT",
                1
            ),
            long_sell_timeout: EnvConfig.ensureNumber(
                "LONG_SELL_TIMEOUT_WEIGHT",
                1
            ),
            sell_and_withdraw_success: EnvConfig.ensureNumber(
                "SELL_AND_WITHDRAW_SUCCESS_WEIGHT",
                1
            ),
        },
    }
}
