export type ThemeName = "default" | "dt-purple" | "dt-light" | "ocean"

export interface IThemeContext {
    theme: ThemeName
    setTheme: (theme: ThemeName) => void
}
