import { ENV_VAR_NAMES } from "../env/const"
import { envManager } from "../env/envManager"
import {
    FEATURE_FLAG_SERVICE_ENDPOINTS,
    LOGIN_SERVICE_ENDPOINTS,
    MANAGER_ENDPOINTS,
} from "./const"

function getManagerBase(): string {
    const protocol = envManager.getEnv(ENV_VAR_NAMES.MANAGER_PROTOCOL)
    const baseUrl = envManager.getEnv(ENV_VAR_NAMES.MANAGER_BASE_URL)
    const port = envManager.getEnv(ENV_VAR_NAMES.MANAGER_PORT)
    return `${protocol}://${baseUrl}:${port}`
}

function getLoginServiceBaseUrl(): string {
    const protocol = envManager.getEnv(ENV_VAR_NAMES.LOGIN_SERIVCE_PROTOCOL)
    const baseUrl = envManager.getEnv(ENV_VAR_NAMES.LOGIN_SERVICE_BASE_URL)
    const port = envManager.getEnv(ENV_VAR_NAMES.LOGIN_SERVICE_PORT)
    return `${protocol}://${baseUrl}:${port}`
}

function getFeatureFlagServiceBaseUrl(): string {
    const protocol = envManager.getEnv(
        ENV_VAR_NAMES.FEATURE_FLAG_SERVICE_PROTOCOL
    )
    const baseUrl = envManager.getEnv(
        ENV_VAR_NAMES.FEATURE_FLAG_SERVICE_BASE_URL
    )
    const port = envManager.getEnv(ENV_VAR_NAMES.FEATURE_FLAG_SERVICE_PORT)

    return `${protocol}://${baseUrl}:${port}`
}

export class ManagerUrls {
    public static getPackagesUrl(): URL {
        return new URL(MANAGER_ENDPOINTS.GET_PACKAGES_API, getManagerBase())
    }

    public static getProductsUrl(): URL {
        return new URL(MANAGER_ENDPOINTS.GET_PRODUCTS_API, getManagerBase())
    }
}

export class LoginServiceUrls {
    public static getCreateNewUserUrl(): URL {
        return new URL(
            LOGIN_SERVICE_ENDPOINTS.CREATE_ACCOUNT_API,
            getLoginServiceBaseUrl()
        )
    }
}

export class FeatureFlagServiceUrls {
    public static getFlagsUrl(): URL {
        return new URL(
            FEATURE_FLAG_SERVICE_ENDPOINTS.GET_FLAGS_API,
            getFeatureFlagServiceBaseUrl()
        )
    }
}
