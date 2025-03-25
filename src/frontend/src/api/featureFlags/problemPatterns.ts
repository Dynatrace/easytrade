import { backends } from "../backend"
import { delay } from "../util"
import { FEATURE_FLAGS } from "./mockData"
import { FeatureFlag, HandlerResponse } from "./types"
import {
    FlagResponseContainer,
    FeatureFlag as RawFeatureFlag,
} from "../backend/problemPatterns"

function featureFlagMapper({
    id,
    enabled,
    name,
    description,
    isModifiable,
}: RawFeatureFlag): FeatureFlag {
    return { id, enabled, name, description, isModifiable }
}

export async function getFeatureFlags(): Promise<FeatureFlag[]> {
    console.log(`getting feature flag list from API`)
    try {
        const { data } = await backends.problemPatterns.getAll()
        console.log(data)
        return data.results.map(featureFlagMapper)
    } catch (error) {
        console.error("error: ", error)
        return []
    }
}

export async function handleFlagToggle(
    flagId: string,
    enabled: boolean
): Promise<HandlerResponse> {
    console.log(
        `setting flag [${flagId}] state to [${JSON.stringify({
            enabled,
        })}]`
    )
    try {
        const { data } =
            await backends.problemPatterns.setProblemPatternEnabled(
                flagId,
                enabled
            )
        console.log(data)
        return {}
    } catch (error) {
        console.error("error: ", error)
        return { error: "There was an error when setting flag state" }
    }
}

export async function mockHandleFlagToggle(flagId: string, enabled: boolean) {
    console.log("mock [handleFeatureFlagChange] API call with params", {
        flagId,
        enabled,
    })
    await delay(2000)
    if (flagId === "1") {
        return { error: "You're an Error Harry!" }
    }
    const index = FEATURE_FLAGS.results.findIndex(({ id }) => id === flagId)
    if (index === -1) {
        return { error: "Flag not found" }
    }
    FEATURE_FLAGS.results[index] = { ...FEATURE_FLAGS.results[index], enabled }
    return {}
}

export async function mockGetFeatureFlags(): Promise<FlagResponseContainer> {
    console.log("mock [getFeatureFlags] API call")
    await delay(2000)
    return FEATURE_FLAGS
}
