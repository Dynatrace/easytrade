import { QueryFunction } from "@tanstack/react-query"
import { ServiceVersion } from "../../../api/version/types"
import { QueryParams } from "../types"

export const versionKeys = {
    all: ["versions"] as const,
}

export function versionsQuery(
    queryFn: QueryFunction<ServiceVersion[]>
): QueryParams<ServiceVersion[]> {
    return {
        queryKey: versionKeys.all,
        queryFn,
    }
}
