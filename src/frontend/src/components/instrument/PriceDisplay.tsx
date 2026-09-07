import React from "react"
import { Price } from "../../api/price/types"
import { InstrumentPrice } from "../../api/instrument/types"
import { useFormatter } from "../../contexts/FormatterContext/context"

export default function PriceDisplay({ price }: { price: Price | InstrumentPrice }) {
    const { formatCurrency, formatPercent } = useFormatter()
    const trendingUp = price.close > price.open
    const percentDifference = (price.close - price.open) / price.open

    return (
        <div
            style={{ display: "flex", alignItems: "baseline", gap: "var(--space-2)" }}
            data-dt-name="Instrument price"
            data-dt-children-name="Instrument variation"
        >
            <h5
                id="instrumentPrice"
                style={{
                    fontWeight: 600,
                    fontFamily: "var(--font-mono)",
                    color: trendingUp ? "var(--success)" : "var(--danger)",
                }}
            >
                {formatCurrency(price.close)}
            </h5>
            <span
                style={{
                    fontSize: "var(--text-xs)",
                    fontWeight: 600,
                    color: trendingUp ? "var(--success)" : "var(--danger)",
                }}
            >
                {formatPercent(percentDifference)}
            </span>
        </div>
    )
}
