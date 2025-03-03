import axios, { AxiosInstance } from "axios"
import { Instrument } from "../instrument/types"

type InstrumentResponse = {
    results: Instrument[]
}

export class InstrumentBackend {
    private readonly agent: AxiosInstance

    constructor(baseUrl: string) {
        this.agent = axios.create({
            baseURL: baseUrl,
            headers: {
                Accept: "application/json",
                "Content-Type": "application/json",
            },
        })
    }

    getInstruments(id?: string) {
        return this.agent.get<InstrumentResponse>(`/instrument?accountId=${id}`)
    }
}
