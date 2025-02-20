import { Theme } from "@mui/material"
import { ThemeMode } from "./theme"

type IThemeContext = {
    theme: Theme
    isDarkTheme: boolean
    toggleTheme: () => void
}

type ThemeProviderProps = {
    initialTheme: ThemeMode
}

export type { IThemeContext, ThemeProviderProps }
