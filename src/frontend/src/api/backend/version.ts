type Version = {
    buildVersion: string
    buildDate: string
    buildCommit: string
}

const TIMEOUT_MS = 1000

export class VersionBackend {
    private readonly headers: Record<string, string>

    constructor() {
        this.headers = {
            Accept: "application/json",
        }
    }

    async getVersion(path: string): Promise<Version> {
        const controller = new AbortController()
        const timer = setTimeout(() => controller.abort(), TIMEOUT_MS)
        try {
            const response = await fetch(path, {
                headers: this.headers,
                signal: controller.signal,
            })
            if (!response.ok) throw new Error(`HTTP ${response.status}`)
            return response.json() as Promise<Version>
        } finally {
            clearTimeout(timer)
        }
    }
}
