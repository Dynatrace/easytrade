import React from "react"
import VersionsTable from "../components/version/VersionsTable"
import { useVersionsQuery } from "../contexts/QueryContext/version/hooks"
import { getFrontendVersion } from "../api/version/versions"

export default function Version() {
    const { isPending, data: versions } = useVersionsQuery()
    if (isPending) {
        return (
            <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "70vh" }}>
                <span className="spinner" style={{ width: 40, height: 40 }} />
            </div>
        )
    }
    return (
        <div>
            <VersionsTable versions={[getFrontendVersion(), ...(versions ?? [])]} />
        </div>
    )
}
