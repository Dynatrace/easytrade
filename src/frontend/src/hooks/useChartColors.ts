export interface ChartColors {
    background: string
    text: string
    grid: string
    up: string
    down: string
    line: string
}

/** Returns chart color values read from the active CSS theme via getComputedStyle. */
export function useChartColors(): ChartColors {
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
