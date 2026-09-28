import { queryOptions, useQuery } from "@tanstack/react-query"
import { Instrument, getInstruments } from "../api/instrument"
import { queryClient } from "../utils/queryClient"
import { instrumentKeys } from "../utils/queryKeys"
import { requireUser } from "./useUser"

export function instrumentsQuery(accountId?: string) {
    return queryOptions({
        queryKey: instrumentKeys.byUser(accountId),
        queryFn: () => getInstruments(accountId),
    })
}

export function useInstrumentsQuery(
    accountId?: string,
    initialData?: Instrument[]
) {
    return useQuery({ ...instrumentsQuery(accountId), initialData })
}

export const instrumentsLoader = requireUser((userId) =>
    queryClient.ensureQueryData(instrumentsQuery(userId))
)
