import { QueryFunction } from "@tanstack/react-query"
import { QueryParams } from "../types"
import { Price } from "../../../api/price/types"

export const priceKeys = {
    all: ["prices"] as const,
    byInstrument: (instrumentId: string) =>
        ["prices", instrumentId.toString()] as const,
}

export function instrumentPricesQuery(
    instrumentId: string,
    queryFn: QueryFunction<Price[]>
): QueryParams<Price[]> {
    return {
        queryKey: priceKeys.byInstrument(instrumentId),
        queryFn,
    }
}
