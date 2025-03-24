/* eslint-disable @typescript-eslint/no-unused-vars */
import {
    EvaluationContext,
    JsonValue,
    Logger,
    Provider,
    ResolutionDetails,
} from "@openfeature/server-sdk"
import { FeatureFlagClient } from "../feature-flag/client"
export class PluginProvider implements Provider {
    private featureFlagClient = new FeatureFlagClient()

    metadata = {
        name: "Plugin Provider",
    }

    async resolveBooleanEvaluation(
        flagKey: string,
        defaultValue: boolean,
        context: EvaluationContext
    ): Promise<ResolutionDetails<boolean>> {
        const plugin = await this.featureFlagClient.getFlag(flagKey)

        return {
            value: plugin?.enabled ?? defaultValue,
            variant: flagKey,
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
