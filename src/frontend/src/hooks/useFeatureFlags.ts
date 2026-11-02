import { queryOptions, useQuery } from "@tanstack/react-query"
import {
    Config,
    ConfigDefaults,
    FeatureFlag,
    getConfig,
    getFeatureFlags,
} from "../api/featureFlags"
import { featureFlagKeys } from "../utils/queryKeys"

export function problemFlagsQuery() {
    return queryOptions({
        queryKey: featureFlagKeys.problemPatterns,
        queryFn: getFeatureFlags,
    })
}

export function configFlagsQuery() {
    return queryOptions({
        queryKey: featureFlagKeys.config,
        queryFn: getConfig,
    })
}

export function useProblemFlagsQuery(initialData?: FeatureFlag[]) {
    return useQuery({ ...problemFlagsQuery(), initialData })
}

export function useConfigFlagsQuery(initialData?: Config) {
    const result = useQuery({ ...configFlagsQuery(), initialData })
    return { ...result, data: result.data ?? ConfigDefaults }
}
