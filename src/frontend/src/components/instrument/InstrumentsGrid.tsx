import React from "react"
import Grid from "@mui/material/Grid2"
import { Instrument } from "../../api/instrument/types"
import InstrumentCard from "./InstrumentCard"

function Item({ id, code, price, name, amount }: Instrument) {
    return (
        <Grid size={{ xs: 12, md: 6, lg: 4, xl: 3 }}>
            <InstrumentCard
                id={id}
                code={code}
                price={price}
                name={name}
                amount={amount}
            />
        </Grid>
    )
}

export default function InstrumentsGrid({
    instruments,
}: {
    instruments: Instrument[]
}) {
    return (
        <Grid container spacing={2} data-dt-features="instruments">
            {instruments.map((instrument) => (
                <Item key={instrument.id} {...instrument} />
            ))}
        </Grid>
    )
}
