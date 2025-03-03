import { logger } from "../logger"
import { MissingEnvVarError } from "./error"

export class EnvVar {
    readonly name: string
    readonly defaultValue: string | undefined
    readonly deferred: boolean

    constructor(
        name: string,
        defaultValue?: string,
        deferred: boolean = false
    ) {
        this.name = name
        this.defaultValue = defaultValue
        this.deferred = deferred
    }

    public valuePresent(): boolean {
        return process.env[this.name] !== undefined
    }

    public hasDefault(): boolean {
        return this.defaultValue !== undefined
    }

    public getValue(): string {
        const value = process.env[this.name]
        if (value === undefined) {
            logger.debug(`Value of env var [${this.name}] is undefined`)
            if (this.defaultValue === undefined) {
                throw new MissingEnvVarError(
                    `Value for env var [${this.name}] is missing`
                )
            }
            logger.debug(
                `Using default value [${this.defaultValue}] for env var [${this.name}]`
            )
            return this.defaultValue
        }
        logger.debug(`Env var [${this.name}] has value [${value}]`)
        return value
    }
}
