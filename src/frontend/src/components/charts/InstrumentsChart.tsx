import { useEffect, useRef } from "react"
import { createChart, ColorType, LineData, LineSeries, Time } from "lightweight-charts"
import { usePortfolioHistoryQuery } from "../../hooks/usePortfolio"
import { CHART_COLORS } from "../../styles/chartColors"

type InstrumentsChartProps = {
    accountId: string
}

export default function InstrumentsChart({ accountId }: InstrumentsChartProps) {
    const containerRef = useRef<HTMLDivElement>(null)
    const { data, isPending, isError } = usePortfolioHistoryQuery(accountId)

    useEffect(() => {
        const el = containerRef.current
        if (!el || isPending || isError || data === undefined) return

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
    }, [data, isPending, isError])

    return (
        <div>
            <div className="chart-header">
                <span style={{ fontSize: "var(--text-sm)", color: "var(--text-secondary)" }}>
                    Portfolio value (24h)
                </span>
            </div>
            {isPending || isError ? (
                <div
                    className="chart-container"
                    data-dt-features="main-chart"
                    data-dt-mouse-over="300"
                    style={{ display: "flex", alignItems: "center", justifyContent: "center" }}
                >
                    {isError ? (
                        <span className="empty-state">
                            Portfolio history is unavailable
                        </span>
                    ) : (
                        <span className="spinner" />
                    )}
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
