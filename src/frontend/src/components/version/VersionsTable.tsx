import React from "react"
import VersionsTabelItem from "./VersionsTableItem"
import { ServiceVersion } from "../../api/version/types"

export type { ServiceVersion }

interface VersionsListProps {
    versions: ServiceVersion[]
}

export default function VersionsTable({ versions }: VersionsListProps) {
    return (
        <table className="data-table">
            <thead>
                <tr>
                    <th>Service</th>
                    <th>Version</th>
                    <th>Build date</th>
                    <th>Build commit</th>
                </tr>
            </thead>
            <tbody>
                {versions.map((service: ServiceVersion) => (
                    <VersionsTabelItem service={service} key={service.serviceName} />
                ))}
            </tbody>
        </table>
    )
}
