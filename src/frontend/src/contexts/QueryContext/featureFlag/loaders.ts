import { QueryClient } from "@tanstack/react-query"
import { FeatureFlag } from "../../../api/featureFlags/types"
import { problemFlagsQuery } from "./queries"

export function featureFlagsLoader(
    client: QueryClient,
    provider: () => Promise<FeatureFlag[]>
) {
    return async () => await client.ensureQueryData(problemFlagsQuery(provider))
}
