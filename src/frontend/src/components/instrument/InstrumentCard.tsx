import React from "react"
import { Link } from "react-router"
import { Price } from "../../api/backend/prices"
import { InstrumentPrice } from "../../api/instrument/types"
import { useFormatter } from "../../contexts/FormatterContext/context"

type Props = {
    id: string
    code: string
    name: string
    price: Price | InstrumentPrice
    amount: number
}

export default function InstrumentCard({ id, code, name, price, amount }: Props) {
    const { formatCurrency, formatPercent } = useFormatter()

    const trendingUp = price.close >= price.open
    const pctChange = price.open !== 0 ? (price.close - price.open) / price.open : 0
    const trendClass = trendingUp ? "up" : "down"

    return (
        <div className={`instrument-card${amount > 0 ? " owned-instrument" : ""}`}>
            <Link to={`/instruments/${id}`}>
                {/* Ticker + company name */}
                <div
                    className="instrument-card-identity"
                    data-dt-name="Instrument symbol"
                    data-dt-children-name="Instrument name"
                >
                    <span className="instrument-code">{code}</span>
                    <span className="instrument-name">{name}</span>
                </div>

                {/* Price + percent change */}
                <div
                    className="instrument-card-price-row"
                    data-dt-name="Instrument price"
                    data-dt-children-name="Instrument variation"
                >
                    <h5
                        id="instrumentPrice"
                        className={`instrument-price ${trendClass}`}
                    >
                        {formatCurrency(price.close)}
                    </h5>
                    <span className={`instrument-pct ${trendClass}`}>
                        {formatPercent(pctChange)}
                    </span>
                </div>

                {/* Owned quantity — always rendered to keep uniform card height */}
                <div
                    className={`instrument-card-amount${amount > 0 ? " owned" : ""}`}
                    data-dt-name="Instrument volume"
                >
                    {amount > 0 ? amount.toLocaleString("en-US") : ""}
                </div>
            </Link>
        </div>
    )
}
