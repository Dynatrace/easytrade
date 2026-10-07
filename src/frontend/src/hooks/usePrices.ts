import { queryOptions, useQuery } from "@tanstack/react-query"
import { getPricesForInstrument } from "../api/price"
import { priceKeys } from "../utils/queryKeys"

export function instrumentPricesQuery(instrumentId: string) {
    return queryOptions({
        queryKey: priceKeys.byInstrument(instrumentId),
        queryFn: () => getPricesForInstrument(instrumentId),
    })
}

export function useInstrumentPricesQuery(instrumentId: string) {
    return useQuery(instrumentPricesQuery(instrumentId))
}
