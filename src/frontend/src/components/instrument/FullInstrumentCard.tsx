import React from "react"
import InstrumentHeader from "./InstrumentHeader"
import { useInstrument } from "../../contexts/InstrumentContext/context"
import InstrumentPriceChart from "../charts/InstrumentPriceChart"
import { useInstrumentPricesQuery } from "../../contexts/QueryContext/price/hooks"

export default function FullInstrumentCard() {
    const { instrument } = useInstrument()
    const { data, isPending, isError } = useInstrumentPricesQuery(instrument.id)

    return (
        <div className="card" style={{ padding: "1rem" }}>
            <div style={{ marginBottom: "0.5rem" }}>
                <InstrumentHeader instrument={instrument} />
                <p style={{ color: "var(--text-muted)", fontStyle: "italic", margin: 0 }}>{instrument.code}</p>
            </div>
            {isPending ? (
                <div className="chart-container" style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <span className="spinner" />
                </div>
            ) : isError ? (
                <div className="chart-container" style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <span className="status-message status-error">
                        Could not load prices for {instrument.code}.
                    </span>
                </div>
            ) : (
                <InstrumentPriceChart prices={data ?? []} />
            )}
        </div>
    )
}
