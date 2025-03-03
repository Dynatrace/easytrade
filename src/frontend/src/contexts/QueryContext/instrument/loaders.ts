import { QueryClient } from "@tanstack/react-query"
import { transform } from "../QueryContext"
import { Instrument } from "../../../api/instrument/types"
import { instrumentsQuery } from "./queries"

export function instrumentsLoader(
    client: QueryClient,
    instrumentsProvider: (userId?: string) => Promise<Instrument[]>
) {
    const queryFn = transform(instrumentsProvider)

    return async (userId?: string) => {
        return await client.ensureQueryData(instrumentsQuery(queryFn(userId)))
    }
}
