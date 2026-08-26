import React from "react"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { featureFlagKeys } from "../../contexts/QueryContext/featureFlag/queries"
import { handleFlagToggle } from "../../api/featureFlags/problemPatterns"
import { Dispatch } from "react"
import { Action } from "./FeatureFlagList"
import { useConfigFlagsQuery } from "../../contexts/QueryContext/featureFlag/hooks"
import { ContentCopyIcon, ExpandMoreIcon } from "../icons"

function getFeatureFlagCurl(flagId: string, enable: boolean): string {
    return `curl -X PUT "${window.location.origin}/feature-flag-service/v1/flags/${flagId}" -H "Content-Type: application/json" -d '{"enabled": ${enable}}'`
}

export default function FeatureFlagItem({
    flagId,
    name,
    description,
    enabled,
    expanded,
    isModifiable,
    dispatchHandler,
}: {
    flagId: string
    name: string
    description?: string
    enabled: boolean
    expanded: boolean
    isModifiable: boolean
    dispatchHandler: Dispatch<Action>
}) {
    const queryClient = useQueryClient()
    const { mutate, isPending } = useMutation({
        mutationFn: async () => {
            const { error } = await handleFlagToggle(flagId, !enabled)
            if (error !== undefined) throw error
        },
        onMutate: () => {
            return { enabled: !enabled }
        },
        onSuccess: async (_data, _vars, context) => {
            await queryClient.invalidateQueries({
                queryKey: featureFlagKeys.problemPatterns,
                exact: true,
            })
            dispatchHandler({
                type: "success",
                msg: `Flag ${name} ${context?.enabled ? "enabled" : "disabled"} successfully.`,
            })
        },
        onError: (error: string, _vars, context) => {
            console.error(error)
            dispatchHandler({
                type: "error",
                msg: `Error while ${context?.enabled ? "enabling" : "disabling"} flag ${name}: ${error}.`,
            })
        },
    })

    const { data: config } = useConfigFlagsQuery()
    const displayName = name
        .split("_")
        .map(([head, ...tail]) => `${head.toUpperCase()}${tail.join("")}`)
        .join(" ")
    const curlCommand = getFeatureFlagCurl(flagId, !enabled)
    const modifyDisabled = !isModifiable || !config?.featureFlagManagement

    return (
        <div className="flag-item">
            <button
                type="button"
                className="flag-item-header"
                onClick={() => dispatchHandler({ type: "expand", target: name })}
                aria-expanded={expanded}
            >
                <span className="flag-item-title">{displayName}</span>
                <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
                    <span className={"badge " + (isModifiable ? "badge-info" : "badge-warning")}>
                        {isModifiable ? "modifiable" : "non-modifiable"}
                    </span>
                    <span className={"badge " + (enabled ? "badge-success" : "badge-danger")}>
                        {enabled ? "enabled" : "disabled"}
                    </span>
                    <ExpandMoreIcon style={{ transform: expanded ? "rotate(180deg)" : "none", transition: "none" }} />
                </div>
            </button>
            {expanded && (
                <div className="flag-item-body">
                    <div style={{ display: "flex", gap: "1rem", justifyContent: "space-between", alignItems: "flex-start" }}>
                        <div style={{ flex: 1 }}>
                            <p style={{ margin: "0 0 0.25rem" }}>
                                <span style={{ color: "var(--accent)" }}>Flag id:</span> {flagId}
                            </p>
                            <p style={{ margin: "0 0 0.5rem" }}>
                                <span style={{ color: "var(--accent)" }}>Description:</span>{" "}
                                {description ?? "There is no description for this flag currently."}
                            </p>
                            <p style={{ margin: "0 0 0.25rem", color: "var(--accent)" }}>
                                CURL to {enabled ? "disable" : "enable"} the feature flag:
                            </p>
                            <div className="curl-box">
                                <code style={{ fontSize: "0.8rem", wordBreak: "break-all" }}>{curlCommand}</code>
                                <button
                                    type="button"
                                    className="btn btn-ghost"
                                    style={{ flexShrink: 0 }}
                                    onClick={() => {
                                        void navigator.clipboard.writeText(curlCommand)
                                        dispatchHandler({ type: "success", msg: "Copied to clipboard!" })
                                    }}
                                    title="Copy to clipboard"
                                >
                                    <ContentCopyIcon />
                                </button>
                            </div>
                        </div>
                        <div>
                            <button
                                type="button"
                                className={"btn " + (enabled ? "btn-danger" : "btn-primary")}
                                disabled={modifyDisabled || isPending}
                                onClick={() => mutate()}
                                data-dt-mouse-over="300"
                                title={modifyDisabled ? "Managing flags on frontend has been disabled in this environment" : undefined}
                            >
                                {isPending ? <span className="spinner" /> : null}
                                {enabled ? "Disable" : "Enable"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
