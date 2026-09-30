import { queryOptions, useQuery } from "@tanstack/react-query"
import { Price, getPricesForInstrument } from "../api/price"
import { queryClient } from "../utils/queryClient"
import { priceKeys } from "../utils/queryKeys"

export function instrumentPricesQuery(instrumentId: string) {
    return queryOptions({
        queryKey: priceKeys.byInstrument(instrumentId),
        queryFn: () => getPricesForInstrument(instrumentId),
    })
}

export function useInstrumentPricesQuery(
    instrumentId: string,
    initialData?: Price[]
) {
    return useQuery({ ...instrumentPricesQuery(instrumentId), initialData })
}

export function instrumentPricesLoader(instrumentId: string) {
    return queryClient.ensureQueryData(instrumentPricesQuery(instrumentId))
}
