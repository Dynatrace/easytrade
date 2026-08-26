import React from "react"
import FeatureFlagList from "../components/featureFlags/FeatureFlagList"
import {
    useConfigFlagsQuery,
    useProblemFlagsQuery,
} from "../contexts/QueryContext/featureFlag/hooks"
import { ReplayIcon } from "../components/icons"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { featureFlagKeys } from "../contexts/QueryContext/featureFlag/queries"
import { delay } from "../api/util"

export default function FeatureFlags() {
    const { data: flags } = useProblemFlagsQuery()
    const { data: config } = useConfigFlagsQuery()
    const queryClient = useQueryClient()
    const { mutate, isPending } = useMutation({
        mutationFn: async () => {
            await Promise.all([
                delay(500),
                queryClient.refetchQueries({ queryKey: featureFlagKeys.all }),
            ])
        },
    })

    return (
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            <div className="card" style={{ padding: "1rem" }}>
                <p style={{ margin: 0 }}>
                    Feature flags (or problem patterns) are used to enable or disable
                    specific problem simulation in EasyTrade application. Each feature flag
                    (problem pattern) comes with its own description of what parts of the
                    application are affected and what symptoms should be expected.
                </p>
            </div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div>
                    {!config?.featureFlagManagement && (
                        <div className="status-message status-info">
                            The feature flag modification via UI has been disabled.
                        </div>
                    )}
                </div>
                <button
                    type="button"
                    className="btn btn-ghost"
                    disabled={isPending}
                    onClick={() => mutate()}
                    title="Refresh flags"
                >
                    <ReplayIcon />
                </button>
            </div>
            {isPending && <div className="status-message">Refreshing...</div>}
            <FeatureFlagList featureFlags={flags ?? []} />
        </div>
    )
}
