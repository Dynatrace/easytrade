import React from "react"
import {
    Paper,
    TableContainer,
    Table,
    TableHead,
    TableCell,
    TableBody,
    TableRow,
} from "@mui/material"
import VersionsTabelItem from "./VersionsTableItem"
import { ServiceVersion } from "../../api/version/types"

export type { ServiceVersion }

interface VersionsListProps {
    versions: ServiceVersion[]
}

export default function VersionsTable(props: VersionsListProps) {
    return (
        <TableContainer component={Paper}>
            <Table>
                <TableHead>
                    <TableRow>
                        <TableCell>Service</TableCell>
                        <TableCell>Version</TableCell>
                        <TableCell>Build date</TableCell>
                        <TableCell>Build commit</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {props.versions.map((service: ServiceVersion) => (
                        <VersionsTabelItem
                            service={service}
                            key={service.serviceName}
                        />
                    ))}
                </TableBody>
            </Table>
        </TableContainer>
    )
}
