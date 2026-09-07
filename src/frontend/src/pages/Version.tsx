import VersionsTable from "../components/version/VersionsTable"
import { useVersionsQuery } from "../contexts/QueryContext/version/hooks"
import { getFrontendVersion } from "../api/version/versions"
import { PageSpinner } from "../components/PageSpinner"

export default function Version() {
    const { isPending, data: versions } = useVersionsQuery()

    if (isPending) {
        return <PageSpinner />
    }

    return (
        <div className="page-solo">
        <div style={{ maxWidth: 760, margin: "0 auto", width: "100%", display: "flex", flexDirection: "column", gap: "var(--space-5)" }}>
            <div>
                <h2 style={{ marginBottom: "var(--space-2)" }}>Service Versions</h2>
                <p style={{ color: "var(--text-secondary)", fontSize: "var(--text-sm)" }}>
                    Build version, date, and commit for each EasyTrade service.
                    Entries highlighted in red differ from the frontend build.
                </p>
            </div>
            <div style={{ overflowX: "auto" }}>
                <VersionsTable versions={[getFrontendVersion(), ...(versions ?? [])]} />
            </div>
        </div>
        </div>
    )
}
