import { queryOptions, useQuery } from "@tanstack/react-query"
import { ServiceVersion, getAllVersions } from "../api/version"
import { versionKeys } from "../utils/queryKeys"

export function versionsQuery() {
    return queryOptions({
        queryKey: versionKeys.all,
        queryFn: getAllVersions,
    })
}

export function useVersionsQuery(initialData?: ServiceVersion[]) {
    return useQuery({ ...versionsQuery(), initialData })
}
