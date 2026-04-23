/* eslint-disable @typescript-eslint/no-unused-vars */
import {
    EvaluationContext,
    JsonValue,
    Logger,
    OpenFeature,
    Provider,
    ResolutionDetails,
} from "@openfeature/server-sdk"
import { logger } from "./logger"
import { urls } from "./config"

// ---------------------------------------------------------------------------
// Provider — resolves feature flags via the feature-flag service REST API
// ---------------------------------------------------------------------------

interface FeatureFlag {
    enabled: boolean
}

class EasyTradeProvider implements Provider {
    metadata = {
        name: "EasyTrade Provider",
    }

    async resolveBooleanEvaluation(
        flagKey: string,
        defaultValue: boolean,
        context: EvaluationContext
    ): Promise<ResolutionDetails<boolean>> {
        try {
            const url = urls.getFeatureFlag(flagKey)
            logger.info(`Sending request to [${url}]`)
            const res = await fetch(url)
            if (!res.ok) {
                logger.warn(
                    `Feature flag request failed with status [${res.status}]`
                )
                return { value: defaultValue, variant: flagKey }
            }
            const flag: FeatureFlag = await res.json()
            return { value: flag?.enabled ?? defaultValue, variant: flagKey }
        } catch (err) {
            logger.warn(`Error when getting feature flag [${err}]`)
            return { value: defaultValue, variant: flagKey }
        }
    }

    resolveStringEvaluation(
        flagKey: string,
        defaultValue: string,
        context: EvaluationContext
    ): Promise<ResolutionDetails<string>> {
        throw new Error("Method not implemented.")
    }

    resolveNumberEvaluation(
        flagKey: string,
        defaultValue: number,
        context: EvaluationContext
    ): Promise<ResolutionDetails<number>> {
        throw new Error("Method not implemented.")
    }

    resolveObjectEvaluation<T extends JsonValue>(
        flagKey: string,
        defaultValue: T,
        context: EvaluationContext,
        logger: Logger
    ): Promise<ResolutionDetails<T>> {
        throw new Error("Method not implemented.")
    }
}

// ---------------------------------------------------------------------------
// Initialise once — import this module before anything uses the client
// ---------------------------------------------------------------------------

OpenFeature.setProvider(new EasyTradeProvider())

export const openFeatureClient = OpenFeature.getClient("offerservice")
