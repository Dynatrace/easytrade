import React, { useState } from "react"
import { BuildIcon } from "../icons"
import { VersionDialog } from "./VersionDialog"
import { getFrontendVersion } from "../../api/version/versions"

export default function VersionInfo({ variant }: { variant?: "sidebar" }) {
    const [modalOpen, setModalOpen] = useState(false)
    return (
        <>
            {variant === "sidebar" ? (
                <button
                    className="nav-link"
                    style={{ width: "100%", background: "none", border: "none", cursor: "pointer", fontFamily: "inherit", fontSize: "inherit" }}
                    onClick={() => setModalOpen(true)}
                    title="Version info"
                >
                    <BuildIcon width={18} height={18} />
                    Version
                </button>
            ) : (
                <button
                    className="btn btn-ghost btn-icon"
                    onClick={() => setModalOpen(true)}
                    title="Version info"
                >
                    <BuildIcon width={18} height={18} />
                </button>
            )}
            <VersionDialog
                open={modalOpen}
                closeHandler={() => setModalOpen(false)}
                serviceVersion={getFrontendVersion().data}
            />
        </>
    )
}
