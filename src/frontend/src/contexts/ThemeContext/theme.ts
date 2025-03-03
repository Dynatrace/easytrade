import { createTheme } from "@mui/material"
import { useMediaQuery } from "@mui/material"

const themes = {
    dark: createTheme({
        palette: {
            mode: "dark",
        },
    }),
    light: createTheme({}),
}

type ThemeMode = keyof typeof themes

function getPreferredTheme(): ThemeMode {
    const prefersDark = useMediaQuery("(prefers-color-scheme: dark)")
    return prefersDark ? "dark" : "light"
}

export { themes, getPreferredTheme }
export type { ThemeMode }
