import { Instrument } from "../instrument/types"

type InstrumentResponse = {
    results: Instrument[]
}

export class InstrumentBackend {
    private readonly baseUrl: string
    private readonly headers: Record<string, string>

    constructor(baseUrl: string) {
        this.baseUrl = baseUrl
        this.headers = {
            Accept: "application/json",
            "Content-Type": "application/json",
        }
    }

    async getInstruments(id?: string): Promise<InstrumentResponse> {
        const response = await fetch(
            `${this.baseUrl}/instrument?accountId=${id}`,
            { headers: this.headers }
        )
        if (!response.ok) throw new Error(`HTTP ${response.status}`)
        return response.json() as Promise<InstrumentResponse>
    }
}
