import { useQuery } from "@tanstack/react-query"
import { ServiceVersion } from "../../../api/version/types"
import { useQueryContext } from "../QueryContext"
import { versionsQuery } from "./queries"

export function useVersionsQuery(initialData?: ServiceVersion[]) {
    const { getVersions } = useQueryContext()
    return useQuery({ ...versionsQuery(getVersions), initialData })
}
