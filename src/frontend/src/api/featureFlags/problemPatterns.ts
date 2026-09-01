import { backends } from "../backend"
import { FeatureFlag, HandlerResponse } from "./types"
import { FeatureFlag as RawFeatureFlag } from "../backend/problemPatterns"

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
        const data = await backends.problemPatterns.getAll()
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
        const data =
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

