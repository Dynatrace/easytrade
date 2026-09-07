import React from "react"
import InstrumentHeader from "./InstrumentHeader"
import { useInstrument } from "../../contexts/InstrumentContext/context"
import { useRouteLoaderData } from "react-router"
import InstrumentPriceChart from "../charts/InstrumentPriceChart"
import { LoaderIds } from "../../router"
import { Price } from "../../api/price/types"
import { useInstrumentPricesQuery } from "../../contexts/QueryContext/price/hooks"

export default function FullInstrumentCard() {
    const { instrument } = useInstrument()
    const pricesData = useRouteLoaderData(LoaderIds.prices) as Price[]
    const { data } = useInstrumentPricesQuery(instrument.id, pricesData)

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
