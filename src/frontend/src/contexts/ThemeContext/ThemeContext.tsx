import React from "react"
import { createContext, PropsWithChildren, useContext, useState } from "react"
import { ThemeProvider as MuiThemeProvider } from "@mui/material"
import { getPreferredTheme, themes } from "./theme"
import { IThemeContext, ThemeProviderProps } from "./types"

const ThemeContext = createContext<IThemeContext>({
    theme: themes.dark,
    themeMode: "dark",
    isDarkTheme: true,
    toggleTheme: () => {},
})

function useTheme() {
    return useContext(ThemeContext)
}

function ThemeProvider({
    initialTheme = getPreferredTheme(),
    children,
}: PropsWithChildren<ThemeProviderProps>) {
    const [themeMode, setThemeMode] = useState(initialTheme)
    const theme = themes[themeMode]
    const isDarkTheme = themeMode === "dark"

    function toggleTheme() {
        setThemeMode((prev) => (prev === "dark" ? "light" : "dark"))
    }

    return (
        <ThemeContext.Provider
            value={{ theme, themeMode, isDarkTheme, toggleTheme }}
        >
            <MuiThemeProvider theme={theme}>{children}</MuiThemeProvider>
        </ThemeContext.Provider>
    )
}

export { ThemeProvider, useTheme }
