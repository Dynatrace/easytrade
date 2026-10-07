import { PropsWithChildren } from "react"
import InstrumentHeader from "./InstrumentHeader"
import { useInstrument } from "../../contexts/InstrumentContext/context"
import InstrumentPriceChart from "../charts/InstrumentPriceChart"
import { useInstrumentPricesQuery } from "../../hooks/usePrices"

function ChartPlaceholder({ children }: PropsWithChildren) {
    return (
        <div
            className="chart-container"
            style={{ display: "flex", alignItems: "center", justifyContent: "center" }}
        >
            {children}
        </div>
    )
}

export default function FullInstrumentCard() {
    const { instrument } = useInstrument()
    const { data, isPending, isError } = useInstrumentPricesQuery(instrument.id)

    return (
        <div className="card" style={{ padding: "1rem" }}>
            <div style={{ marginBottom: "0.5rem" }}>
                <InstrumentHeader instrument={instrument} />
                <p style={{ color: "var(--text-muted)", fontStyle: "italic", margin: 0 }}>{instrument.code}</p>
            </div>
            {isPending && (
                <ChartPlaceholder>
                    <span className="spinner" />
                </ChartPlaceholder>
            )}
            {isError && (
                <ChartPlaceholder>
                    <span className="status-message status-error">
                        Could not load prices for {instrument.code}.
                    </span>
                </ChartPlaceholder>
            )}
            {data && <InstrumentPriceChart prices={data} />}
        </div>
    )
}
