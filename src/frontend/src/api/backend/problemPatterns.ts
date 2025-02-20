import axios, { AxiosInstance } from "axios"

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
    private readonly agent: AxiosInstance

    constructor(baseUrl: string) {
        this.agent = axios.create({
            baseURL: baseUrl,
            headers: {
                Accept: "application/json",
            },
        })
    }

    getAll() {
        return this.agent.get<FlagResponseContainer>("/flags", {
            params: {
                tag: "problem_pattern",
            },
        })
    }

    setProblemPatternEnabled(flagId: string, enabled: boolean) {
        return this.agent.put(`/flags/${flagId}`, { enabled })
    }
}
