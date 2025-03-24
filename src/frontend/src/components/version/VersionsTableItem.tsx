import React from "react"
import { TableRow, TableCell, Alert } from "@mui/material"
import { ServiceVersion } from "../../api/version/types"
import { getFrontendVersion } from "../../api/version/versions"

interface VersionListItemProps {
    service: ServiceVersion
}

interface DifferenceAlertProps {
    value: string
    expectedValue: string
}

function DifferenceWarning(props: DifferenceAlertProps) {
    return props.value === props.expectedValue ? (
        props.value
    ) : (
        <Alert severity="warning">{props.value}</Alert>
    )
}

export default function VersionsTabelItem(props: VersionListItemProps) {
    if (!props.service.success) {
        return (
            <TableRow>
                <TableCell>{props.service.serviceName}</TableCell>
                <TableCell colSpan={3}>
                    <Alert severity="error">{props.service.message}</Alert>
                </TableCell>
            </TableRow>
        )
    }

    const frontendVersion = getFrontendVersion()
    return (
        <TableRow>
            <TableCell>{props.service.serviceName}</TableCell>
            <TableCell>
                <DifferenceWarning
                    value={props.service.data.buildVersion}
                    expectedValue={frontendVersion.data.buildVersion}
                />
            </TableCell>
            <TableCell>
                <DifferenceWarning
                    value={props.service.data.buildDate}
                    expectedValue={frontendVersion.data.buildDate}
                />
            </TableCell>
            <TableCell>
                <DifferenceWarning
                    value={props.service.data.buildCommit}
                    expectedValue={frontendVersion.data.buildCommit}
                />
            </TableCell>
        </TableRow>
    )
}
