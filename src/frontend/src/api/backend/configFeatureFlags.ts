export type FeatureFlag = {
    id: string
    enabled: boolean
    name: string
    description: string
    isModifiable: boolean
    tag: string
}
export type FlagResponseContainer = {
    results: FeatureFlag[]
}

export class ConfigBackend {
    private readonly baseUrl: string
    private readonly headers: Record<string, string>

    constructor(baseUrl: string) {
        this.baseUrl = baseUrl
        this.headers = {
            Accept: "application/json",
        }
    }

    async getAll(): Promise<FlagResponseContainer> {
        const response = await fetch(`${this.baseUrl}/flags?tag=config`, {
            headers: this.headers,
        })
        if (!response.ok) throw new Error(`HTTP ${response.status}`)
        return response.json() as Promise<FlagResponseContainer>
    }
}
