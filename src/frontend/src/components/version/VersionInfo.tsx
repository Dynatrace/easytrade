import React from "react"
import { Build } from "@mui/icons-material"
import { IconButton } from "@mui/material"
import { useState } from "react"
import { VersionDialog } from "./VersionDialog"
import { getFrontendVersion } from "../../api/version/versions"

export default function VersionInfo() {
    const [modalOpen, setModalOpen] = useState(false)
    return (
        <>
            <IconButton
                sx={{
                    color: "inherit",
                    display: { xs: "none", sm: "block" },
                }}
                onClick={() => setModalOpen(true)}
            >
                <Build fontSize="small" />
            </IconButton>
            <VersionDialog
                open={modalOpen}
                closeHandler={() => setModalOpen(false)}
                serviceVersion={getFrontendVersion().data}
            />
        </>
    )
}
