import { logger } from "./logger"

function env(name: string, defaultValue: string): string {
    const value = process.env[name]
    if (value === undefined) {
        logger.debug(
            `Env var [${name}] not set, using default [${defaultValue}]`
        )
        return defaultValue
    }
    logger.debug(`Env var [${name}] has value [${value}]`)
    return value
}

export const config = {
    dbAdapterAddress: env("DB_ADAPTER_ADDRESS", "localhost:50051"),

    userServiceAddress: env("USER_SERVICE_ADDRESS", "http://localhost:8080"),

    featureFlagServiceAddress: env("FEATURE_FLAG_SERVICE_ADDRESS", "http://localhost:8080"),
} as const

export const urls = {
    createAccount: () =>
        `${config.userServiceAddress}/api/auth/signup`,
    getFeatureFlag: (flagId: string) =>
        `${config.featureFlagServiceAddress}/v1/flags/${flagId}`,
} as const

export const SLOWDOWN_DELAY_MS = 2000
export const SLOWDOWN_AFFECTED_PLATFORM_COUNT = 2
export const PLATFORMS = [
    "dynatestsieger.at",
    "tradeCom.co.uk",
    "CryptoTrading.com",
    "CheapTrading.mi",
    "Stratton-oakmount.com",
]
