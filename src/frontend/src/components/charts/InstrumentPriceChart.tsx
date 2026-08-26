import React from "react"
import { Price } from "../../api/price/types"

type CandlestickChartProps = {
    prices: Price[]
}

// TODO (Stage 12): Replace with lightweight-charts candlestick implementation
export default function InstrumentPriceChart({ prices }: CandlestickChartProps) {
    return (
        <div
            className="chart-container"
            data-dt-mouse-over="300"
            style={{ height: 200, display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text-muted)" }}
        >
            {prices.length === 0 ? "No price data" : `${prices.length} price records`}
        </div>
    )
}
