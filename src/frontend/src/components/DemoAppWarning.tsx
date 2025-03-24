import React from "react"
import { Alert, Box } from "@mui/material"

export default function DemoAppWarning() {
    return (
        <Box sx={{ display: "flex", justifyContent: "center" }}>
            <Alert severity="warning">
                This is a demo app. Please do not enter real data because it may
                not be protected properly.
            </Alert>
        </Box>
    )
}
