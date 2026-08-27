import React, { useReducer } from "react"
import { FeatureFlag } from "../../api/featureFlags/types"
import FeatureFlagItem from "./FeatureFlagItem"

export type FeedbackAction =
    | { type: "success"; msg: string }
    | { type: "error"; msg: string }
    | { type: "reset" }

// ExpandAction kept for type-compat with existing callers but no longer used
export type ExpandAction =
    | { type: "expand"; target: string }
    | { type: "collapse" }

export type Action = FeedbackAction | ExpandAction

type State = {
    feedback: {
        visible: boolean
        variant: "success" | "error"
        msg: string
    }
}

function feedbackReducer(state: State, action: Action): State {
    switch (action.type) {
        case "success":
            return { feedback: { visible: true, variant: "success", msg: action.msg } }
        case "error":
            return { feedback: { visible: true, variant: "error", msg: action.msg } }
        case "reset":
            return { feedback: { visible: false, msg: "", variant: state.feedback.variant } }
        case "expand":
        case "collapse":
            return state  // no-op — each item manages its own modal
        default:
            throw new Error(`Action ${JSON.stringify(action)} is not handled in [FeedbackReducer]!`)
    }
}

export default function FeatureFlagList({ featureFlags }: { featureFlags: FeatureFlag[] }) {
    const [{ feedback }, dispatch] = useReducer(feedbackReducer, {
        feedback: { visible: false, msg: "", variant: "success" },
    })

    return (
        <div>
            <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-2)" }}>
                {featureFlags.map(({ id, name, description, enabled, isModifiable }, idx) => (
                    <FeatureFlagItem
                        key={idx}
                        flagId={id}
                        enabled={enabled}
                        description={description}
                        name={name}
                        isModifiable={isModifiable}
                        dispatchHandler={dispatch}
                    />
                ))}
            </div>
            {feedback.visible && (
                <div
                    className={"status-message " + (feedback.variant === "success" ? "status-success" : "status-error")}
                    style={{ marginTop: "var(--space-4)", display: "flex", alignItems: "center", justifyContent: "space-between" }}
                >
                    <span>{feedback.msg}</span>
                    <button
                        type="button"
                        className="btn btn-ghost"
                        style={{ padding: "0.25rem" }}
                        onClick={() => dispatch({ type: "reset" })}
                    >
                        ✕
                    </button>
                </div>
            )}
        </div>
    )
}
