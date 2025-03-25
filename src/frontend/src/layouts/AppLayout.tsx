import React from "react"
import { Stack } from "@mui/material"
import AppHeader from "../components/AppHeader/AppHeader"
import { Outlet } from "react-router"
import { useTheme } from "../contexts/ThemeContext/ThemeContext"

export default function AppLayout() {
    const { themeMode } = useTheme()
    return (
        <Stack
            sx={{ display: "flex" }}
            spacing={5}
            data-dt-properties={`theme:${themeMode}`}
        >
            <AppHeader />
            <Outlet />
        </Stack>
    )
}
