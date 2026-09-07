import React from "react"
import { FeatureFlag } from "../../api/featureFlags/types"
import FeatureFlagItem from "./FeatureFlagItem"

export default function FeatureFlagList({ featureFlags }: { featureFlags: FeatureFlag[] }) {
    return (
        <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-2)" }}>
            {featureFlags.map(({ id, name, description, enabled, isModifiable }, idx) => (
                <FeatureFlagItem
                    key={idx}
                    flagId={id}
                    enabled={enabled}
                    description={description}
                    name={name}
                    isModifiable={isModifiable}
                />
            ))}
        </div>
    )
}
