import { QueryClient } from "@tanstack/react-query"
import { instrumentPricesQuery } from "./queries"
import { transform } from "../QueryContext"

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
