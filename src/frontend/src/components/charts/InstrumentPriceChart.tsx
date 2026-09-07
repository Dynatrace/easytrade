import React, { useEffect, useRef } from "react"
import { createChart, ColorType, CandlestickData, CandlestickSeries, Time } from "lightweight-charts"
import { Price } from "../../api/price/types"
import { CHART_COLORS } from "../../styles/chartColors"

type CandlestickChartProps = {
    prices: Price[]
}

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
            upColor: CHART_COLORS.up,
            downColor: CHART_COLORS.down,
            borderUpColor: CHART_COLORS.up,
            borderDownColor: CHART_COLORS.down,
            wickUpColor: CHART_COLORS.up,
            wickDownColor: CHART_COLORS.down,
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
