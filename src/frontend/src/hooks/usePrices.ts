import { queryOptions, useQuery } from "@tanstack/react-query"
import { Price, getPricesForInstrument } from "../api/price"
import { queryClient } from "../utils/queryClient"
import { priceKeys } from "../utils/queryKeys"
import { LoaderFunctionArgs } from "react-router"
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

export async function instrumentPricesLoader({ params }: LoaderFunctionArgs) {
    const instrumentId = params.id
    if (!instrumentId) {
        throw new Response("Instrument ID missing", { status: 400 })
    }
    return queryClient.ensureQueryData(instrumentPricesQuery(instrumentId))
}
