import React from "react"
import Grid2 from "@mui/material/Grid2"
import { Instrument } from "../../api/instrument/types"
import InstrumentCard from "./InstrumentCard"

function Item({ id, code, price, name, amount }: Instrument) {
    return (
        <Grid2 size={{ xs: 12, md: 6, lg: 4, xl: 3 }}>
            <InstrumentCard
                id={id}
                code={code}
                price={price}
                name={name}
                amount={amount}
            />
        </Grid2>
    )
}

export default function InstrumentsGrid({
    instruments,
}: {
    instruments: Instrument[]
}) {
    return (
        <Grid2 container spacing={2} data-dt-features="instruments">
            {instruments.map((instrument) => (
                <Item key={instrument.id} {...instrument} />
            ))}
        </Grid2>
    )
}
