import axios, { AxiosInstance } from "axios"
import { XMLParser } from "fast-xml-parser"

export type Price = {
    id: number
    instrumentId: number
    timestamp: string
    open: number
    close: number
    high: number
    low: number
}

type PriceResponse = {
    results: Price[]
}

type PriceResponseXml = {
    pricesResult: PriceResponse
}

export class PriceBackend {
    private readonly agent: AxiosInstance

    private readonly parser: XMLParser

    constructor(baseUrl: string) {
        this.agent = axios.create({
            baseURL: baseUrl,
            headers: {
                Accept: "application/xml",
                "Content-Type": "application/xml",
            },
        })
        this.parser = new XMLParser()
    }

    async getLatestXml(xmlParser: XMLParser) {
        const response = await this.agent.get("/prices/latest")
        return xmlParser.parse(response.data) as PriceResponseXml
    }

    async getForInstrumentXml(xmlParser: XMLParser, instrumentId: string) {
        const response = await this.agent.get(
            `/prices/instrument/${instrumentId}?records=1440`
        )
        return xmlParser.parse(response.data) as PriceResponseXml
    }
}
