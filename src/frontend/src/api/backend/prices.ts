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
    private readonly baseUrl: string
    private readonly headers: Record<string, string>

    constructor(baseUrl: string) {
        this.baseUrl = baseUrl
        this.headers = {
            Accept: "application/xml",
            "Content-Type": "application/xml",
        }
    }

    async getLatestXml(xmlParser: XMLParser): Promise<PriceResponseXml> {
        const response = await fetch(`${this.baseUrl}/prices/latest`, {
            headers: this.headers,
        })
        if (!response.ok) throw new Error(`HTTP ${response.status}`)
        return xmlParser.parse(await response.text()) as PriceResponseXml
    }

    async getForInstrumentXml(
        xmlParser: XMLParser,
        instrumentId: string
    ): Promise<PriceResponseXml> {
        const response = await fetch(
            `${this.baseUrl}/prices/instrument/${instrumentId}?records=1440`,
            { headers: this.headers }
        )
        if (!response.ok) throw new Error(`HTTP ${response.status}`)
        return xmlParser.parse(await response.text()) as PriceResponseXml
    }
}
