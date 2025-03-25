import React from "react"
import { Alert, Fade, Stack } from "@mui/material"
import { StatusDisplayContext } from "../hooks/useStatusDisplay"

export default function StatusDisplay({
    isError,
    isSuccess,
    successMsg,
    errorMsg,
}: StatusDisplayContext) {
    return (
        <Stack>
            <Fade in={isError()} appear={false} unmountOnExit>
                <Alert severity="error" variant="outlined">
                    {errorMsg()}
                </Alert>
            </Fade>
            <Fade in={isSuccess()} appear={false} unmountOnExit>
                <Alert severity="success" variant="outlined">
                    {successMsg()}
                </Alert>
            </Fade>
        </Stack>
    )
}
