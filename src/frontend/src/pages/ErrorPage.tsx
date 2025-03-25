import React from "react"
import { Box, Card, CssBaseline, Typography } from "@mui/material"
import { useRouteError } from "react-router"
import { getPreferredTheme } from "../contexts/ThemeContext/theme"
import { ThemeProvider } from "../contexts/ThemeContext/ThemeContext"

export default function ErrorPage() {
    const error = useRouteError()

    return (
        <ThemeProvider initialTheme={getPreferredTheme()}>
            <CssBaseline />
            <Box justifyContent="center" alignItems="center">
                <Card sx={{ padding: 2, margin: 5 }}>
                    <Typography
                        variant="h6"
                        sx={{
                            mr: 2,
                            fontWeight: 600,
                            color: "error",
                            textDecoration: "none",
                        }}
                    >
                        Oops! There was an error!
                    </Typography>
                    <Typography>{JSON.stringify(error)}</Typography>
                </Card>
            </Box>
        </ThemeProvider>
    )
}
