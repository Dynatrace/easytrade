import React from "react"
import { FlagIcon } from "../icons"
import { useProblemFlagsQuery } from "../../contexts/QueryContext/featureFlag/hooks"

export default function FeatureFlagIcon() {
    const { data: flags } = useProblemFlagsQuery()
    const enabledFlagCount = flags?.filter(({ enabled }) => enabled)?.length ?? 0

    return (
        <span className="flag-badge">
            <FlagIcon width={18} height={18} />
            {enabledFlagCount > 0 && (
                <span className="flag-count">{enabledFlagCount}</span>
            )}
        </span>
    )
}
