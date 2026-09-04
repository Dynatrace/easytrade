import { useQuery } from "@tanstack/react-query"
import { useQueryContext } from "../QueryContext"
import { instrumentPricesQuery } from "./queries"
import { Price } from "../../../api/price/types"

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
