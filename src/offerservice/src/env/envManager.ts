import { logger } from "../logger"
import { ENV_VAR_NAMES } from "./const"
import { EnvVar } from "./envVar"

export class EnvManager {
    private envVars: Map<string, EnvVar>

    constructor() {
        this.envVars = new Map<string, EnvVar>()
    }

    register(envVar: EnvVar): void {
        logger.info(`Adding env var [${envVar.name}] to manager`)
        this.envVars.set(envVar.name, envVar)
    }

    getEnvList(): string[] {
        return Array.from(this.envVars.keys())
    }

    getEnv(name: string): string {
        const envVar = this.envVars.get(name)
        if (envVar === undefined) {
            throw new Error(`Env var [${name}] is not registered`)
        }
        return envVar.getValue()
    }

    checkEnvVars(): void {
        const missing: string[] = []
        const deffered: string[] = []
        const checked: string[] = []
        const defaults: string[] = []
        this.envVars.forEach((envVar) => {
            const list = envVar.valuePresent()
                ? checked
                : envVar.hasDefault()
                  ? defaults
                  : envVar.deferred
                    ? deffered
                    : missing
            list.push(envVar.name)
        })
        if (checked.length > 0) {
            logger.debug(
                `Values found for [${JSON.stringify(checked)}] env vars`
            )
        }
        if (defaults.length > 0) {
            logger.debug(
                `Default values found for [${JSON.stringify(
                    defaults
                )}] env vars`
            )
        }
        if (deffered.length > 0) {
            logger.debug(
                `Value not found but env var marked as defferd [${JSON.stringify(
                    deffered
                )}]`
            )
        }
        if (missing.length > 0) {
            throw new Error(
                `Values missing for env vars [${JSON.stringify(missing)}]`
            )
        }
    }
}

export const envManager = new EnvManager()
envManager.register(new EnvVar(ENV_VAR_NAMES.MANAGER_BASE_URL, "localhost"))
envManager.register(new EnvVar(ENV_VAR_NAMES.MANAGER_PORT, "8081"))
envManager.register(new EnvVar(ENV_VAR_NAMES.MANAGER_PROTOCOL, "http"))

envManager.register(
    new EnvVar(ENV_VAR_NAMES.LOGIN_SERVICE_BASE_URL, "localhost")
)
envManager.register(new EnvVar(ENV_VAR_NAMES.LOGIN_SERVICE_PORT, "8081"))
envManager.register(new EnvVar(ENV_VAR_NAMES.LOGIN_SERIVCE_PROTOCOL, "http"))

envManager.register(new EnvVar(ENV_VAR_NAMES.APP_PORT, "8080"))

envManager.register(
    new EnvVar(ENV_VAR_NAMES.FEATURE_FLAG_SERVICE_BASE_URL, "localhost")
)
envManager.register(new EnvVar(ENV_VAR_NAMES.FEATURE_FLAG_SERVICE_PORT, "80"))
envManager.register(
    new EnvVar(ENV_VAR_NAMES.FEATURE_FLAG_SERVICE_PROTOCOL, "http")
)
