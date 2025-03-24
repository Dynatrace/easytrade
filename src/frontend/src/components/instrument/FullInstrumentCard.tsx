import React from "react"
import { Card, CardHeader } from "@mui/material"
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
        <Card>
            <CardHeader
                title={<InstrumentHeader instrument={instrument} />}
                subheader={instrument.code}
                slotProps={{
                    subheader: {
                        sx: {
                            fontStyle: "italic",
                        },
                    },
                }}
            />
            <InstrumentPriceChart prices={data ?? []} />
        </Card>
    )
}
