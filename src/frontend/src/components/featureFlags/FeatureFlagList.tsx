import React from "react"
import { Alert, Box, Snackbar } from "@mui/material"
import { FeatureFlag } from "../../api/featureFlags/types"
import { useReducer } from "react"
import FeatureFlagItem from "./FeatureFlagItem"

export type FeedbackAction =
    | { type: "success"; msg: string }
    | { type: "error"; msg: string }
    | { type: "reset" }
export type ExpandAction =
    | { type: "expand"; target: string }
    | { type: "collapse" }

export type Action = FeedbackAction | ExpandAction
type State = {
    expand: {
        target: string
    }
    feedback: {
        visible: boolean
        variant: "success" | "error"
        msg: string
    }
}
function feedbackReducer(state: State, action: Action): State {
    switch (action.type) {
        case "success": {
            return {
                ...state,
                feedback: {
                    visible: true,
                    variant: "success",
                    msg: action.msg,
                },
            }
        }
        case "error": {
            return {
                ...state,
                feedback: { visible: true, variant: "error", msg: action.msg },
            }
        }
        case "reset": {
            return {
                ...state,
                feedback: {
                    visible: false,
                    msg: "",
                    variant: state.feedback.variant,
                },
            }
        }
        case "expand": {
            return {
                ...state,
                expand: {
                    target:
                        state.expand.target === action.target
                            ? ""
                            : action.target,
                },
            }
        }
        case "collapse": {
            return { ...state, expand: { target: "" } }
        }
        default: {
            throw new Error(
                `Action ${JSON.stringify(
                    action
                )} is not handler in [FeedbackReducer]!`
            )
        }
    }
}

export default function FeatureFlagList({
    featureFlags,
}: {
    featureFlags: FeatureFlag[]
}) {
    const [{ expand, feedback }, dispatch] = useReducer(feedbackReducer, {
        expand: { target: "" },
        feedback: { visible: false, msg: "", variant: "success" },
    })
    return (
        <Box>
            {featureFlags.map(
                ({ id, name, description, enabled, isModifiable }, idx) => (
                    <FeatureFlagItem
                        key={idx}
                        flagId={id}
                        enabled={enabled}
                        description={description}
                        name={name}
                        isModifiable={isModifiable}
                        expanded={expand.target === name}
                        dispatchHandler={dispatch}
                    />
                )
            )}
            <Snackbar
                open={feedback.visible}
                anchorOrigin={{ horizontal: "center", vertical: "bottom" }}
                autoHideDuration={5000}
                onClose={(event, reason) => {
                    if (reason !== "clickaway") {
                        dispatch({ type: "reset" })
                    }
                }}
            >
                <Alert
                    severity={feedback.variant}
                    variant="filled"
                    onClose={() => dispatch({ type: "reset" })}
                >
                    {feedback.msg}
                </Alert>
            </Snackbar>
        </Box>
    )
}
