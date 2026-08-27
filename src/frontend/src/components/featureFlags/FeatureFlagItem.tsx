import React, { useEffect, useRef, useState } from "react"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { featureFlagKeys } from "../../contexts/QueryContext/featureFlag/queries"
import { handleFlagToggle } from "../../api/featureFlags/problemPatterns"
import { Dispatch } from "react"
import { Action } from "./FeatureFlagList"
import { useConfigFlagsQuery } from "../../contexts/QueryContext/featureFlag/hooks"
import { ContentCopyIcon } from "../icons"

function getFeatureFlagCurl(flagId: string, enable: boolean): string {
    return `curl -X PUT "${window.location.origin}/feature-flag-service/v1/flags/${flagId}" -H "Content-Type: application/json" -d '{"enabled": ${enable}}'`
}

export default function FeatureFlagItem({
    flagId,
    name,
    description,
    enabled,
    isModifiable,
    dispatchHandler,
}: {
    flagId: string
    name: string
    description?: string
    enabled: boolean
    isModifiable: boolean
    dispatchHandler: Dispatch<Action>
}) {
    const [modalOpen, setModalOpen] = useState(false)
    const dialogRef = useRef<HTMLDialogElement>(null)

    useEffect(() => {
        const el = dialogRef.current
        if (!el) return
        if (modalOpen) {
            el.showModal()
        } else {
            el.close()
        }
    }, [modalOpen])

    const queryClient = useQueryClient()
    const { mutate, isPending } = useMutation({
        mutationFn: async () => {
            const { error } = await handleFlagToggle(flagId, !enabled)
            if (error !== undefined) throw error
        },
        onMutate: () => ({ enabled: !enabled }),
        onSuccess: async (_data, _vars, context) => {
            await queryClient.invalidateQueries({
                queryKey: featureFlagKeys.problemPatterns,
                exact: true,
            })
            dispatchHandler({
                type: "success",
                msg: `Flag ${displayName} ${context?.enabled ? "enabled" : "disabled"} successfully.`,
            })
        },
        onError: (error: string, _vars, context) => {
            console.error(error)
            dispatchHandler({
                type: "error",
                msg: `Error while ${context?.enabled ? "enabling" : "disabling"} flag ${displayName}: ${error}.`,
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

    function closeModal() {
        setModalOpen(false)
    }

    return (
        <>
            {/* List row — click to open detail modal */}
            <button
                type="button"
                className="flag-list-row"
                onClick={() => setModalOpen(true)}
            >
                <span className="flag-list-name">{displayName}</span>
                <div style={{ display: "flex", gap: "var(--space-2)", alignItems: "center", flexShrink: 0 }}>
                    <span className={"badge " + (isModifiable ? "badge-info" : "badge-warning")}>
                        {isModifiable ? "modifiable" : "non-modifiable"}
                    </span>
                    <span className={"badge " + (enabled ? "badge-success" : "badge-danger")}>
                        {enabled ? "enabled" : "disabled"}
                    </span>
                </div>
            </button>

            {/* Detail modal — same pattern as VersionDialog */}
            {modalOpen && (
                <dialog ref={dialogRef} onClose={closeModal}>
                    <div className="flag-dialog-header">
                        <h3>{displayName}</h3>
                        <button
                            type="button"
                            className="btn btn-ghost btn-icon"
                            onClick={closeModal}
                            title="Close"
                        >
                            ✕
                        </button>
                    </div>

                    <div className="form" style={{ gap: "var(--space-3)" }}>
                        <div className="info-row">
                            <span className="info-label">Flag ID</span>
                            <span className="info-value" style={{ wordBreak: "break-all" }}>{flagId}</span>
                        </div>
                        <div className="info-row">
                            <span className="info-label">Status</span>
                            <span className={"badge " + (enabled ? "badge-success" : "badge-danger")}>
                                {enabled ? "enabled" : "disabled"}
                            </span>
                        </div>
                        <div className="info-row">
                            <span className="info-label">Modifiable</span>
                            <span className={"badge " + (isModifiable ? "badge-info" : "badge-warning")}>
                                {isModifiable ? "yes" : "no"}
                            </span>
                        </div>
                        {description && (
                            <div style={{ paddingTop: "var(--space-2)", borderTop: "1px solid var(--border)" }}>
                                <p style={{ color: "var(--text-secondary)", fontSize: "var(--text-sm)", margin: 0 }}>
                                    {description}
                                </p>
                            </div>
                        )}
                        <div style={{ paddingTop: "var(--space-2)", borderTop: "1px solid var(--border)" }}>
                            <p style={{ color: "var(--text-secondary)", fontSize: "var(--text-xs)", marginBottom: "var(--space-2)" }}>
                                CURL to {enabled ? "disable" : "enable"}:
                            </p>
                            <div className="curl-box">
                                <code style={{ fontSize: "var(--text-xs)", wordBreak: "break-all" }}>
                                    {curlCommand}
                                </code>
                                <button
                                    type="button"
                                    className="btn btn-ghost btn-icon"
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
                    </div>

                    <div className="form-actions" style={{ marginTop: "var(--space-6)" }}>
                        <button
                            type="button"
                            className={"btn " + (enabled ? "btn-danger" : "btn-primary")}
                            disabled={modifyDisabled || isPending}
                            onClick={() => mutate()}
                            data-dt-mouse-over="300"
                            title={modifyDisabled ? "Managing flags via UI is disabled in this environment" : undefined}
                        >
                            {isPending ? <span className="spinner" /> : null}
                            {enabled ? "Disable" : "Enable"}
                        </button>
                        <button type="button" className="btn btn-secondary" onClick={closeModal}>
                            Close
                        </button>
                    </div>
                </dialog>
            )}
        </>
    )
}
