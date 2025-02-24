import { useQuery } from "@tanstack/react-query"
import { Config, FeatureFlag } from "../../../api/featureFlags/types"
import { useQueryContext } from "../QueryContext"
import { configFlagsQuery, problemFlagsQuery } from "./queries"

export function useProblemFlagsQuery(initialData?: FeatureFlag[]) {
    const { getFeatureFlags } = useQueryContext()
    return useQuery({ ...problemFlagsQuery(getFeatureFlags), initialData })
}

export function useConfigFlagsQuery(initialData?: Config) {
    const { getConfig } = useQueryContext()
    return useQuery({ ...configFlagsQuery(getConfig), initialData })
}
