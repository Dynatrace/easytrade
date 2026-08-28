import { useTheme } from "../contexts/ThemeContext/context"

export interface ChartColors {
    background: string
    text: string
    grid: string
    up: string
    down: string
    line: string
}

/**
 * Returns chart color values read from the active CSS theme.
 * Subscribes to ThemeContext so the consumer re-renders on theme change,
 * then reads the current computed CSS custom properties.
 */
export function useChartColors(): ChartColors {
    // Consuming theme causes React to re-render this hook's consumer on change.
    // Actual values come from getComputedStyle — CSS cascade handles theming.
    useTheme()

    const style = getComputedStyle(document.documentElement)
    const get = (v: string) => style.getPropertyValue(v).trim()

    return {
        background: get("--chart-bg"),
        text:       get("--chart-text"),
        grid:       get("--chart-grid"),
        up:         get("--chart-up"),
        down:       get("--chart-down"),
        line:       get("--chart-line"),
    }
}
