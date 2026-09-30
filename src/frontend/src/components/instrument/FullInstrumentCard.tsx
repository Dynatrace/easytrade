import InstrumentHeader from "./InstrumentHeader"
import { useInstrument } from "../../contexts/InstrumentContext/context"
import InstrumentPriceChart from "../charts/InstrumentPriceChart"
import { useInstrumentPricesQuery } from "../../hooks/usePrices"

export default function FullInstrumentCard() {
    const { instrument } = useInstrument()
    const { data } = useInstrumentPricesQuery(instrument.id)

    return (
        <div className="card" style={{ padding: "1rem" }}>
            <div style={{ marginBottom: "0.5rem" }}>
                <InstrumentHeader instrument={instrument} />
                <p style={{ color: "var(--text-muted)", fontStyle: "italic", margin: 0 }}>{instrument.code}</p>
            </div>
            <InstrumentPriceChart prices={data ?? []} />
        </div>
    )
}
