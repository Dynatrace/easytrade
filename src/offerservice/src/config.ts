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
    appPort: parseInt(env("APP_PORT", "8080")),

    dbAdapterHostAndPort: env("DBADAPTER_HOSTANDPORT", "localhost:50051"),

    loginServiceUrl: `${env("LOGIN_SERVICE_PROTOCOL", "http")}://${env("LOGIN_SERVICE_BASE_URL", "localhost")}:${env("LOGIN_SERVICE_PORT", "8081")}`,

    featureFlagServiceUrl: `${env("FEATURE_FLAG_SERVICE_PROTOCOL", "http")}://${env("FEATURE_FLAG_SERVICE_BASE_URL", "localhost")}:${env("FEATURE_FLAG_SERVICE_PORT", "80")}`,
} as const

export const urls = {
    createAccount: () =>
        `${config.loginServiceUrl}/api/Accounts/CreateNewAccount`,
    getFeatureFlag: (flagId: string) =>
        `${config.featureFlagServiceUrl}/v1/flags/${flagId}`,
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
