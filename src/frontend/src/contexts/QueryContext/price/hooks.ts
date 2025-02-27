import { useQuery } from "@tanstack/react-query"
import { useQueryContext } from "../QueryContext"
import { instrumentPricesQuery, latestPricesQuery } from "./queries"
import { Price } from "../../../api/price/types"

export function useLatestPricesQuery(initialData?: Price[]) {
    const { getLatestPrices } = useQueryContext()
    return useQuery({
        ...latestPricesQuery(getLatestPrices),
        initialData,
    })
}

export function useInstrumentPricesQuery(
    instrumentId: string,
    initialData?: Price[]
) {
    const { getInstrumentPrices } = useQueryContext()
    return useQuery({
        ...instrumentPricesQuery(
            instrumentId,
            getInstrumentPrices(instrumentId)
        ),
        initialData,
    })
}
