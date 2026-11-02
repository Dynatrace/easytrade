import { XMLParser } from "fast-xml-parser"
import { getXml, services } from "../http"
import { Price } from "./types"
export * from "./types"

type PriceDto = Omit<Price, "id" | "instrumentId"> & {
    id: string | number
    instrumentId: string | number
}

type PricesXmlDto = {
    pricesResult: { results?: PriceDto[] } | ""
}

const parser = new XMLParser({
    isArray: (_name, jpath) => jpath === "pricesResult.results",
})

export async function getPricesForInstrument(
    instrumentId: string
): Promise<Price[]> {
    const body = await getXml(
        `${services.pricing()}/prices/instrument/${instrumentId}?records=1440`
    )
    const { pricesResult } = parser.parse(body) as PricesXmlDto
    const results = pricesResult === "" ? [] : (pricesResult.results ?? [])
    return results.map(({ id, instrumentId, ...rest }) => ({
        ...rest,
        id: id.toString(),
        instrumentId: instrumentId.toString(),
    }))
}
