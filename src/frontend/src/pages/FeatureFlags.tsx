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
        <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-5)" }}>
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "var(--space-4)", flexWrap: "wrap" }}>
                <div style={{ flex: 1 }}>
                    <h2 style={{ marginBottom: "var(--space-2)" }}>Feature Flags</h2>
                    <p style={{ color: "var(--text-secondary)", fontSize: "var(--text-sm)", maxWidth: 600 }}>
                        Feature flags control problem pattern simulations in EasyTrade.
                        Each flag targets a specific part of the application when enabled.
                    </p>
                    {!config?.featureFlagManagement && (
                        <div className="status-message status-info" style={{ marginTop: "var(--space-3)", display: "inline-flex" }}>
                            Flag modification via UI is disabled in this environment.
                        </div>
                    )}
                </div>
                <button
                    type="button"
                    className="btn btn-secondary"
                    disabled={isPending}
                    onClick={() => mutate()}
                    title="Refresh flags"
                    style={{ flexShrink: 0 }}
                >
                    <ReplayIcon />
                    {isPending ? "Refreshing…" : "Refresh"}
                </button>
            </div>
            <FeatureFlagList featureFlags={flags ?? []} />
        </div>
    )
}
