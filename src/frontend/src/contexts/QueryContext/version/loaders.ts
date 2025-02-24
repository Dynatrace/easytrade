import { QueryClient } from "@tanstack/react-query"
import { ServiceVersion } from "../../../api/version/types"
import { versionsQuery } from "./queries"

export function versionsLoader(
    client: QueryClient,
    provider: () => Promise<ServiceVersion[]>
) {
    return async () => await client.ensureQueryData(versionsQuery(provider))
}
