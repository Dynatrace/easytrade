import { QueryClient } from "@tanstack/react-query"
import { instrumentPricesQuery, latestPricesQuery } from "./queries"
import { Price } from "../../../api/price/types"
import { transform } from "../QueryContext"

export function latestPricesLoader(
    client: QueryClient,
    pricesProvider: () => Promise<Price[]>
) {
    return async () => {
        return await client.ensureQueryData(latestPricesQuery(pricesProvider))
    }
}

export function instrumentPricesLoader(
    client: QueryClient,
    pricesProvider: (instrumentId: string) => Promise<Price[]>
) {
    const queryFn = transform(pricesProvider)

    return async (instrumentId: string) => {
        return await client.ensureQueryData(
            instrumentPricesQuery(instrumentId, queryFn(instrumentId))
        )
    }
}
