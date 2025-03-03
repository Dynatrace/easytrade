import axios, { AxiosInstance } from "axios"

type Version = {
    buildVersion: string
    buildDate: string
    buildCommit: string
}

export class VersionBackend {
    private readonly agent: AxiosInstance

    constructor() {
        this.agent = axios.create({
            headers: {
                Accept: "application/json",
            },
        })
        this.agent.defaults.timeout = 1000
    }

    getVersion(path: string) {
        return this.agent.get<Version>(path)
    }
}
