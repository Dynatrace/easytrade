import React from "react"
import { DarkMode, LightMode } from "@mui/icons-material"
import { IconButton } from "@mui/material"
import { useTheme } from "../contexts/ThemeContext/ThemeContext"

export function ThemeSwitcher() {
    const { isDarkTheme, toggleTheme } = useTheme()

    return (
        <IconButton onClick={toggleTheme}>
            {isDarkTheme ? <DarkMode /> : <LightMode />}
        </IconButton>
    )
}
