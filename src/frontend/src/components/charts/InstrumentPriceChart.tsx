import React, { useEffect, useRef } from "react"
import { createChart, ColorType, CandlestickData, CandlestickSeries, Time } from "lightweight-charts"
import { Price } from "../../api/price/types"

type CandlestickChartProps = {
    prices: Price[]
}

const CHART_COLORS = {
    background: "#1a1f2e",
    text: "#b0bec5",
    grid: "#2a3042",
    upColor: "#26a69a",
    downColor: "#ef5350",
    borderUp: "#26a69a",
    borderDown: "#ef5350",
    wickUp: "#26a69a",
    wickDown: "#ef5350",
} as const

export default function InstrumentPriceChart({ prices }: CandlestickChartProps) {
    const containerRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        const el = containerRef.current
        if (!el) return

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

        const series = chart.addSeries(CandlestickSeries, {
            upColor: CHART_COLORS.upColor,
            downColor: CHART_COLORS.downColor,
            borderUpColor: CHART_COLORS.borderUp,
            borderDownColor: CHART_COLORS.borderDown,
            wickUpColor: CHART_COLORS.wickUp,
            wickDownColor: CHART_COLORS.wickDown,
        })

        const candles: CandlestickData[] = prices
            .map((p) => ({
                time: (new Date(p.timestamp).getTime() / 1000) as Time,
                open: p.open,
                high: p.high,
                low: p.low,
                close: p.close,
            }))
            .sort((a, b) => (a.time as number) - (b.time as number))

        series.setData(candles)
        chart.timeScale().fitContent()

        const observer = new ResizeObserver(() => {
            chart.applyOptions({ width: el.clientWidth })
        })
        observer.observe(el)

        return () => {
            observer.disconnect()
            chart.remove()
        }
    }, [prices])

    return (
        <div
            ref={containerRef}
            className="chart-container"
            data-dt-mouse-over="300"
            style={{ height: 300 }}
        />
    )
}
