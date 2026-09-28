export type FeatureFlag = {
    id: string
    name: string
    description: string
    enabled: boolean
    isModifiable: boolean
}

export type Config = {
    featureFlagManagement: boolean
}

export type HandlerResponse = {
    error?: string
}
