import React from "react"
import Grid2 from "@mui/material/Grid2"
import VersionsTable from "../components/version/VersionsTable"
import { useVersionsQuery } from "../contexts/QueryContext/version/hooks"
import { Box, CircularProgress } from "@mui/material"
import { getFrontendVersion } from "../api/version/versions"

export default function Version() {
    const { isPending, data: versions } = useVersionsQuery()
    if (isPending) {
        return (
            <Box
                display="flex"
                justifyContent="center"
                alignItems="center"
                minHeight="70vh"
            >
                <CircularProgress color="inherit" />
            </Box>
        )
    }
    return (
        <Grid2 container>
            <Grid2
                size={{ xs: 12, md: 10, lg: 8 }}
                offset={{ xs: 0, md: 1, lg: 2 }}
            >
                <VersionsTable
                    versions={[getFrontendVersion(), ...(versions ?? [])]}
                />
            </Grid2>
        </Grid2>
    )
}
