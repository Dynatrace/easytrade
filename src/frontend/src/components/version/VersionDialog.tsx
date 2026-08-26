import React, { useEffect, useRef } from "react"
import { Link } from "react-router"
import { ServiceVersionData } from "../../api/version/types"

interface VersionDialogProps {
    open: boolean
    closeHandler: () => void
    serviceVersion: ServiceVersionData
}

export function VersionDialog({ open, closeHandler, serviceVersion }: VersionDialogProps) {
    const dialogRef = useRef<HTMLDialogElement>(null)

    useEffect(() => {
        const el = dialogRef.current
        if (!el) return
        if (open) {
            el.showModal()
        } else {
            el.close()
        }
    }, [open])

    if (!open) return null

    return (
        <dialog
            ref={dialogRef}
            onClose={closeHandler}
            style={{
                background: "var(--bg-card)",
                border: "1px solid var(--border)",
                borderRadius: "var(--radius-lg)",
                color: "var(--text-primary)",
                padding: "var(--space-6)",
                minWidth: "280px",
            }}
        >
            <h2 style={{ marginBottom: "var(--space-5)" }}>EasyTrade</h2>
            <div className="form" style={{ gap: "var(--space-3)" }}>
                <div className="info-row">
                    <span className="info-label">Version</span>
                    <span className="info-value">{serviceVersion.buildVersion}</span>
                </div>
                <div className="info-row">
                    <span className="info-label">Build date</span>
                    <span className="info-value">{serviceVersion.buildDate}</span>
                </div>
                <div className="info-row">
                    <span className="info-label">Build commit</span>
                    <span className="info-value" style={{ wordBreak: "break-all" }}>
                        {serviceVersion.buildCommit}
                    </span>
                </div>
            </div>
            <div className="form-actions" style={{ marginTop: "var(--space-6)" }}>
                <Link to="/version" className="btn btn-secondary" onClick={closeHandler}>
                    More
                </Link>
                <button className="btn btn-secondary" onClick={closeHandler}>
                    Close
                </button>
            </div>
        </dialog>
    )
}
