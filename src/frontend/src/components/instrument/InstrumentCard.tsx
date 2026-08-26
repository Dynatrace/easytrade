import React from "react"
import { Link } from "react-router"
import PriceDisplay from "./PriceDisplay"
import { Price } from "../../api/backend/prices"
import { InstrumentPrice } from "../../api/instrument/types"

type Props = {
    id: string
    code: string
    name: string
    price: Price | InstrumentPrice
    amount: number
}

export default function InstrumentCard({ id, code, price, name, amount }: Props) {
    return (
        <div className={`instrument-card${amount > 0 ? " owned-instrument" : ""}`}>
            <Link to={`/instruments/${id}`}>
                <div>
                    <div
                        data-dt-name="Instrument symbol"
                        data-dt-children-name="Instrument name"
                    >
                        <span className="instrument-code">{code}</span>
                        <span className="instrument-name" style={{ fontStyle: "italic" }}>
                            {name}
                        </span>
                    </div>
                </div>
                <div style={{ marginTop: "var(--space-3)" }}>
                    <PriceDisplay price={price} />
                    <div
                        style={{
                            marginTop: "var(--space-2)",
                            fontWeight: 600,
                            fontSize: "var(--text-lg)",
                            fontFamily: "var(--font-mono)",
                            color: "var(--text-secondary)",
                        }}
                        data-dt-name="Instrument volume"
                    >
                        {amount.toLocaleString("en-US")}
                    </div>
                </div>
                {amount > 0 && (
                    <span className="instrument-badge" style={{ marginTop: "var(--space-2)" }}>
                        owned
                    </span>
                )}
            </Link>
        </div>
    )
}
