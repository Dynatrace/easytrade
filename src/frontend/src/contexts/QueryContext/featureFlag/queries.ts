import { QueryFunction } from "@tanstack/react-query"
import { Config, FeatureFlag } from "../../../api/featureFlags/types"
import { QueryParams } from "../types"

export const featureFlagKeys = {
    all: ["feature-flags"] as const,
    problemPatterns: ["feature-flags", "problem-patterns"] as const,
    config: ["feature-flags", "config"] as const,
}

export function problemFlagsQuery(
    queryFn: QueryFunction<FeatureFlag[]>
): QueryParams<FeatureFlag[]> {
    return { queryKey: featureFlagKeys.problemPatterns, queryFn }
}

export function configFlagsQuery(
    queryFn: QueryFunction<Config>
): QueryParams<Config> {
    return { queryKey: featureFlagKeys.config, queryFn }
}
