export type FeatureFlag = {
    id: string
    name: string
    description: string
    enabled: boolean
    isModifiable: boolean
}

export type HandlerResponse = {
    error?: string
}

export type ConfigFlag = {
    name: string
    id: string
    enabled: boolean
}

export type Config = {
    featureFlagManagement: boolean
}

export const ConfigFlagIds = {
    FEATURE_FLAG_MANAGEMENT: "frontend_feature_flag_management",
}

export const ConfigDefaults: Config = { featureFlagManagement: true }
