import React from "react"
import { ServiceVersion } from "../../api/version/types"
import { getFrontendVersion } from "../../api/version/versions"

interface VersionListItemProps {
    service: ServiceVersion
}

interface DifferenceAlertProps {
    value: string
    expectedValue: string
}

function DifferenceWarning({ value, expectedValue }: DifferenceAlertProps) {
    if (value === expectedValue) return <>{value}</>
    return (
        <span className="status-message status-error" style={{ padding: "0.2rem 0.5rem", display: "inline-block" }}>
            {value}
        </span>
    )
}

export default function VersionsTabelItem({ service }: VersionListItemProps) {
    if (!service.success) {
        return (
            <tr>
                <td>{service.serviceName}</td>
                <td colSpan={3}>
                    <span className="status-message status-error" style={{ padding: "0.2rem 0.5rem", display: "inline-block" }}>
                        {service.message}
                    </span>
                </td>
            </tr>
        )
    }

    const frontendVersion = getFrontendVersion()
    return (
        <tr>
            <td>{service.serviceName}</td>
            <td>
                <DifferenceWarning
                    value={service.data.buildVersion}
                    expectedValue={frontendVersion.data.buildVersion}
                />
            </td>
            <td>
                <DifferenceWarning
                    value={service.data.buildDate}
                    expectedValue={frontendVersion.data.buildDate}
                />
            </td>
            <td>
                <DifferenceWarning
                    value={service.data.buildCommit}
                    expectedValue={frontendVersion.data.buildCommit}
                />
            </td>
        </tr>
    )
}
