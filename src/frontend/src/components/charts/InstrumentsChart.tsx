import React, { useEffect, useRef, useState } from "react"
import { createChart, ColorType, LineData, LineSeries, Time } from "lightweight-charts"
import { getPortfolioHistory, PortfolioPoint } from "../../api/portfolio/portfolio"

type InstrumentsChartProps = {
    accountId: string
}

type Period = "1d" | "7d" | "30d"

const PERIODS: { label: string; value: Period }[] = [
    { label: "1D", value: "1d" },
    { label: "7D", value: "7d" },
    { label: "30D", value: "30d" },
]

const CHART_COLORS = {
    background: "#1a1f2e",
    text: "#b0bec5",
    grid: "#2a3042",
    line: "#388bfd",
} as const

export default function InstrumentsChart({ accountId }: InstrumentsChartProps) {
    const containerRef = useRef<HTMLDivElement>(null)
    const [period, setPeriod] = useState<Period>("1d")
    const [data, setData] = useState<PortfolioPoint[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        let cancelled = false
        setLoading(true)
        void getPortfolioHistory(accountId, period).then((points) => {
            if (!cancelled) {
                setData(points)
                setLoading(false)
            }
        })
        return () => { cancelled = true }
    }, [accountId, period])

    useEffect(() => {
        const el = containerRef.current
        if (!el || loading) return

        const chart = createChart(el, {
            layout: {
                background: { type: ColorType.Solid, color: CHART_COLORS.background },
                textColor: CHART_COLORS.text,
            },
            grid: {
                vertLines: { color: CHART_COLORS.grid },
                horzLines: { color: CHART_COLORS.grid },
            },
            width: el.clientWidth,
            height: el.clientHeight,
            timeScale: { timeVisible: true, secondsVisible: false },
        })

        const series = chart.addSeries(LineSeries, { color: CHART_COLORS.line, lineWidth: 2 })

        const lineData: LineData[] = data
            .map((p) => ({
                time: (new Date(p.timestamp).getTime() / 1000) as Time,
                value: p.totalValue,
            }))
            .sort((a, b) => (a.time as number) - (b.time as number))

        series.setData(lineData)
        chart.timeScale().fitContent()

        const observer = new ResizeObserver(() => {
            chart.applyOptions({ width: el.clientWidth })
        })
        observer.observe(el)

        return () => {
            observer.disconnect()
            chart.remove()
        }
    }, [data, loading])

    return (
        <div>
            <div className="chart-header">
                <span style={{ fontSize: "var(--text-sm)", color: "var(--text-secondary)" }}>
                    Portfolio value
                </span>
                <div style={{ display: "flex", gap: "var(--space-2)" }}>
                    {PERIODS.map(({ label, value }) => (
                        <button
                            key={value}
                            type="button"
                            className={"btn btn-ghost" + (period === value ? " active" : "")}
                            style={{ padding: "2px 8px", fontSize: "var(--text-xs)" }}
                            onClick={() => setPeriod(value)}
                        >
                            {label}
                        </button>
                    ))}
                </div>
            </div>
            {loading ? (
                <div
                    className="chart-container"
                    data-dt-features="main-chart"
                    data-dt-mouse-over="300"
                    style={{ display: "flex", alignItems: "center", justifyContent: "center" }}
                >
                    <span className="spinner" />
                </div>
            ) : (
                <div
                    ref={containerRef}
                    className="chart-container"
                    data-dt-features="main-chart"
                    data-dt-mouse-over="300"
                />
            )}
        </div>
    )
}
