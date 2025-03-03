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

export class ConfigBackend {
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
                tag: "config",
            },
        })
    }
}
