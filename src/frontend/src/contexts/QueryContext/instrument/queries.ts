import { QueryFunction } from "@tanstack/react-query"
import { QueryParams } from "../types"
import { Instrument } from "../../../api/instrument/types"

export const instrumentKeys = {
    all: ["instruments"] as const,
}

export function instrumentsQuery(
    queryFn: QueryFunction<Instrument[]>
): QueryParams<Instrument[]> {
    return {
        queryKey: instrumentKeys.all,
        queryFn,
    }
}
