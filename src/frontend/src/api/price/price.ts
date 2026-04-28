import { Price } from "./types"
import { backends } from "../backend"
import { XMLParser } from "fast-xml-parser"

export async function getLatestPrices(): Promise<Price[]> {
    console.log(`[getLatestPrices] API call`)

    try {
        const data = await backends.prices.getLatestXml(new XMLParser())
        return data.pricesResult.results.map(
            ({ id, instrumentId, ...rest }) => ({
                id: id.toString(),
                instrumentId: instrumentId.toString(),
                ...rest,
            })
        )
    } catch (error) {
        console.error("error: ", error)
        return []
    }
}

export async function getPricesForInstrument(
    instrumentId: string
): Promise<Price[]> {
    console.log(
        `[getPricesForInstrument] API call with instrumentId ${instrumentId}`
    )

    try {
        const data = await backends.prices.getForInstrumentXml(
            new XMLParser(),
            instrumentId
        )
        return data.pricesResult.results.map(
            ({ id, instrumentId, ...rest }) => ({
                id: id.toString(),
                instrumentId: instrumentId.toString(),
                ...rest,
            })
        )
    } catch (error) {
        console.error("error: ", error)
        return []
    }
}
