import React from "react"
import { useTheme } from "../../contexts/ThemeContext/context"
import { ThemeName } from "../../contexts/ThemeContext/types"

const THEMES: { label: string; value: ThemeName }[] = [
    { label: "Dark",      value: "default" },
    { label: "DT Purple", value: "dt-purple" },
    { label: "DT Light",  value: "dt-light" },
    { label: "Ocean",     value: "ocean" },
]

export default function ThemeSwitcher() {
    const { theme, setTheme } = useTheme()

    return (
        <select
            className="table-filter-select"
            style={{ width: "120px" }}
            value={theme}
            onChange={(e) => setTheme(e.target.value as ThemeName)}
            aria-label="Select colour theme"
            title="Select colour theme"
        >
            {THEMES.map(({ label, value }) => (
                <option key={value} value={value}>{label}</option>
            ))}
        </select>
    )
}
