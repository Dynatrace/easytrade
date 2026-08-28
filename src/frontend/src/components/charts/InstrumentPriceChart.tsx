import React, { useEffect, useRef } from "react"
import { createChart, ColorType, CandlestickData, CandlestickSeries, Time } from "lightweight-charts"
import { Price } from "../../api/price/types"
import { useChartColors } from "../../hooks/useChartColors"

type CandlestickChartProps = {
    prices: Price[]
}

export default function InstrumentPriceChart({ prices }: CandlestickChartProps) {
    const containerRef = useRef<HTMLDivElement>(null)
    const colors = useChartColors()

    useEffect(() => {
        const el = containerRef.current
        if (!el) return

        const chart = createChart(el, {
            layout: {
                background: { type: ColorType.Solid, color: colors.background },
                textColor: colors.text,
            },
            grid: {
                vertLines: { color: colors.grid },
                horzLines: { color: colors.grid },
            },
            width: el.clientWidth,
            height: el.clientHeight,
            timeScale: { timeVisible: true, secondsVisible: false },
        })

        const series = chart.addSeries(CandlestickSeries, {
            upColor: colors.up,
            downColor: colors.down,
            borderUpColor: colors.up,
            borderDownColor: colors.down,
            wickUpColor: colors.up,
            wickDownColor: colors.down,
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
    }, [prices, colors.background, colors.text, colors.grid, colors.up, colors.down])

    return (
        <div
            ref={containerRef}
            className="chart-container"
            data-dt-mouse-over="300"
            style={{ height: 300 }}
        />
    )
}
