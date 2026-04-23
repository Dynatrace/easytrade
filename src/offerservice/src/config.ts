import { logger } from "./logger"

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

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

// ---------------------------------------------------------------------------
// Environment variables (with defaults)
// ---------------------------------------------------------------------------

export const config = {
    appPort: parseInt(env("APP_PORT", "8080")),

    managerUrl: `${env("MANAGER_PROTOCOL", "http")}://${env("MANAGER_BASE_URL", "localhost")}:${env("MANAGER_PORT", "8081")}`,

    loginServiceUrl: `${env("LOGIN_SERVICE_PROTOCOL", "http")}://${env("LOGIN_SERVICE_BASE_URL", "localhost")}:${env("LOGIN_SERVICE_PORT", "8081")}`,

    featureFlagServiceUrl: `${env("FEATURE_FLAG_SERVICE_PROTOCOL", "http")}://${env("FEATURE_FLAG_SERVICE_BASE_URL", "localhost")}:${env("FEATURE_FLAG_SERVICE_PORT", "80")}`,
} as const

// ---------------------------------------------------------------------------
// URL builders
// ---------------------------------------------------------------------------

export const urls = {
    getPackages: () => `${config.managerUrl}/api/Packages/GetPackages`,
    getProducts: () => `${config.managerUrl}/api/Products/GetProducts`,
    createAccount: () =>
        `${config.loginServiceUrl}/api/Accounts/CreateNewAccount`,
    getFeatureFlag: (flagId: string) =>
        `${config.featureFlagServiceUrl}/v1/flags/${flagId}`,
} as const

// ---------------------------------------------------------------------------
// Slowdown plugin constants
// ---------------------------------------------------------------------------

export const SLOWDOWN_DELAY_MS = 2000
export const SLOWDOWN_AFFECTED_PLATFORM_COUNT = 2
export const PLATFORMS = [
    "dynatestsieger.at",
    "tradeCom.co.uk",
    "CryptoTrading.com",
    "CheapTrading.mi",
    "Stratton-oakmount.com",
]
