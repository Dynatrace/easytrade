import React, { useEffect, useRef, useState } from "react"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { featureFlagKeys } from "../../contexts/QueryContext/featureFlag/queries"
import { handleFlagToggle } from "../../api/featureFlags/problemPatterns"
import { Dispatch } from "react"
import { Action } from "./FeatureFlagList"
import { useConfigFlagsQuery } from "../../contexts/QueryContext/featureFlag/hooks"
import { ContentCopyIcon, InfoIcon, LockIcon } from "../icons"

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
    const modifyDisabled = !isModifiable || !config?.featureFlagManagement
    const curlCommand = getFeatureFlagCurl(flagId, !enabled)

    function closeModal() {
        setModalOpen(false)
    }

    return (
        <>
            {/* List row */}
            <div className="flag-list-row">
                <span className="flag-list-name">{displayName}</span>
                <div style={{ display: "flex", alignItems: "center", gap: "var(--space-3)", flexShrink: 0 }}>
                    {/* Toggle slider */}
                    <label
                        className={`toggle-switch${!isModifiable ? " locked" : ""}`}
                        title={!isModifiable ? "This flag is not modifiable" : enabled ? "Click to disable" : "Click to enable"}
                    >
                        <input
                            type="checkbox"
                            checked={enabled}
                            disabled={modifyDisabled || isPending}
                            onChange={() => mutate()}
                            data-dt-mouse-over="300"
                        />
                        <span className="toggle-track" />
                    </label>

                    {/* Lock icon shown when not modifiable */}
                    {!isModifiable && (
                        <LockIcon
                            style={{ width: 14, height: 14, color: "var(--text-secondary)", flexShrink: 0 }}
                        />
                    )}

                    {/* Info icon — opens detail modal */}
                    <button
                        type="button"
                        className="btn btn-ghost btn-icon"
                        onClick={() => setModalOpen(true)}
                        title="More info"
                        style={{ color: "var(--text-secondary)" }}
                    >
                        <InfoIcon style={{ width: 18, height: 18 }} />
                    </button>
                </div>
            </div>

            {/* Detail modal — description + curl only */}
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

                    <div className="form" style={{ gap: "var(--space-4)" }}>
                        {description ? (
                            <p style={{ color: "var(--text-secondary)", fontSize: "var(--text-sm)", margin: 0 }}>
                                {description}
                            </p>
                        ) : (
                            <p style={{ color: "var(--text-secondary)", fontSize: "var(--text-sm)", margin: 0, fontStyle: "italic" }}>
                                No description available.
                            </p>
                        )}

                        <div style={{ borderTop: "1px solid var(--border)", paddingTop: "var(--space-3)" }}>
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

                    <div className="form-actions" style={{ marginTop: "var(--space-5)" }}>
                        <button type="button" className="btn btn-secondary" onClick={closeModal}>
                            Close
                        </button>
                    </div>
                </dialog>
            )}
        </>
    )
}
