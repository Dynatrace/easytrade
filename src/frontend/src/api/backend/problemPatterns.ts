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

export class ProblemPatternBackend {
    private readonly baseUrl: string
    private readonly headers: Record<string, string>

    constructor(baseUrl: string) {
        this.baseUrl = baseUrl
        this.headers = {
            Accept: "application/json",
        }
    }

    async getAll(): Promise<FlagResponseContainer> {
        const response = await fetch(
            `${this.baseUrl}/flags?tag=problem_pattern`,
            { headers: this.headers }
        )
        if (!response.ok) throw new Error(`HTTP ${response.status}`)
        return response.json() as Promise<FlagResponseContainer>
    }

    async setProblemPatternEnabled(
        flagId: string,
        enabled: boolean
    ): Promise<unknown> {
        const response = await fetch(`${this.baseUrl}/flags/${flagId}`, {
            method: "PUT",
            headers: { ...this.headers, "Content-Type": "application/json" },
            body: JSON.stringify({ enabled }),
        })
        if (!response.ok) throw new Error(`HTTP ${response.status}`)
        const text = await response.text()
        return text ? JSON.parse(text) : undefined
    }
}
