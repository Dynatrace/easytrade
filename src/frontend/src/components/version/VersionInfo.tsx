import React, { useState } from "react"
import { BuildIcon } from "../icons"
import { VersionDialog } from "./VersionDialog"
import { getFrontendVersion } from "../../api/version/versions"

export default function VersionInfo() {
    const [modalOpen, setModalOpen] = useState(false)
    return (
        <>
            <button
                className="btn btn-ghost btn-icon"
                onClick={() => setModalOpen(true)}
                title="Version info"
            >
                <BuildIcon width={18} height={18} />
            </button>
            <VersionDialog
                open={modalOpen}
                closeHandler={() => setModalOpen(false)}
                serviceVersion={getFrontendVersion().data}
            />
        </>
    )
}
