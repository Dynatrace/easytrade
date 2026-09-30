import { getJson, put, services } from "../http"
import { Config, FeatureFlag, HandlerResponse } from "./types"
export * from "./types"

type FlagDto = {
    id: string
    enabled: boolean
    name: string
    description: string
    isModifiable: boolean
    tag: string
    enabledAt?: string
}

type FlagsDto = {
    results: FlagDto[]
}

export const ConfigFlagIds = {
    FEATURE_FLAG_MANAGEMENT: "frontend_feature_flag_management",
}

export const ConfigDefaults: Config = { featureFlagManagement: true }

export async function getFeatureFlags(): Promise<FeatureFlag[]> {
    const { results } = await getJson<FlagsDto>(
        `${services.featureFlag()}/flags?tag=problem_pattern`
    )
    return results.map(({ id, enabled, name, description, isModifiable, enabledAt }) => ({
        id,
        enabled,
        name,
        description,
        isModifiable,
        enabledAt,
    }))
}

export async function getConfig(): Promise<Config> {
    const { results } = await getJson<FlagsDto>(
        `${services.featureFlag()}/flags?tag=config`
    )
    const flag = results.find(
        ({ id }) => id === ConfigFlagIds.FEATURE_FLAG_MANAGEMENT
    )
    return {
        featureFlagManagement:
            flag?.enabled ?? ConfigDefaults.featureFlagManagement,
    }
}

export async function handleFlagToggle(
    flagId: string,
    enabled: boolean
): Promise<HandlerResponse> {
    try {
        await put(`${services.featureFlag()}/flags/${flagId}`, { enabled })
        return {}
    } catch (error) {
        console.error("[handleFlagToggle] failed", error)
        return { error: "There was an error when setting flag state" }
    }
}
