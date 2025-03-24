import React from "react"
import { Stack, Typography } from "@mui/material"
import { Instrument } from "../../api/instrument/types"
import PriceDisplay from "./PriceDisplay"

export default function InstrumentHeader({
    instrument,
}: {
    instrument: Instrument
}) {
    return (
        <Stack direction={"row"} spacing={4} alignItems={"baseline"}>
            <Typography
                id="instrumentName"
                variant="h4"
                sx={{
                    fontFamily: "monospace",
                    fontWeight: 600,
                    color: "inherit",
                    textDecoration: "none",
                }}
            >
                {instrument.name}
            </Typography>
            <PriceDisplay price={instrument.price} />
        </Stack>
    )
}
