import React, { createContext, PropsWithChildren, useContext, useLayoutEffect, useState } from "react"
import { IThemeContext, ThemeName } from "./types"

const STORAGE_KEY = "easytrade-theme"
const DEFAULT_THEME: ThemeName = "default"

const ThemeContext = createContext<IThemeContext | null>(null)

export function ThemeProvider({ children }: PropsWithChildren) {
    const [theme, setThemeState] = useState<ThemeName>(() => {
        const stored = localStorage.getItem(STORAGE_KEY)
        return (stored as ThemeName | null) ?? DEFAULT_THEME
    })

    // useLayoutEffect so data-theme is set before the first paint — avoids flash
    useLayoutEffect(() => {
        const root = document.documentElement
        if (theme === "default") {
            root.removeAttribute("data-theme")
        } else {
            root.setAttribute("data-theme", theme)
        }
    }, [theme])

    function setTheme(next: ThemeName) {
        localStorage.setItem(STORAGE_KEY, next)
        setThemeState(next)
    }

    return (
        <ThemeContext.Provider value={{ theme, setTheme }}>
            {children}
        </ThemeContext.Provider>
    )
}

export function useTheme(): IThemeContext {
    const ctx = useContext(ThemeContext)
    if (ctx === null) {
        throw new Error("useTheme must be used inside ThemeProvider")
    }
    return ctx
}
