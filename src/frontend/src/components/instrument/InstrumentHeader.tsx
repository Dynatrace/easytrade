import React from "react"
import { Instrument } from "../../api/instrument/types"
import PriceDisplay from "./PriceDisplay"

export default function InstrumentHeader({ instrument }: { instrument: Instrument }) {
    return (
        <div style={{ display: "flex", alignItems: "baseline", gap: "var(--space-4)", flexWrap: "wrap" }}>
            <h5
                id="instrumentName"
                style={{ fontFamily: "var(--font-mono)", fontWeight: 600, fontSize: "var(--text-2xl)" }}
            >
                {instrument.name}
            </h5>
            <PriceDisplay price={instrument.price} />
        </div>
    )
}
