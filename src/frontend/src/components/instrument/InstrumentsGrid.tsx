import React from "react"
import { Instrument } from "../../api/instrument/types"
import InstrumentCard from "./InstrumentCard"

export default function InstrumentsGrid({ instruments }: { instruments: Instrument[] }) {
    return (
        <div className="instruments-grid" data-dt-features="instruments">
            {instruments.map((instrument) => (
                <InstrumentCard
                    key={instrument.id}
                    id={instrument.id}
                    code={instrument.code}
                    price={instrument.price}
                    name={instrument.name}
                    amount={instrument.amount}
                />
            ))}
        </div>
    )
}
