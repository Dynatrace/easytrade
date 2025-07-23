import React from "react"
import Grid2 from "@mui/material/Grid2"
import { Navigate, useParams, useRouteLoaderData } from "react-router"
import FullInstrumentCard from "../../components/instrument/FullInstrumentCard"
import InstrumentTransactions from "../../components/instrument/InstrumentTransactions"
import { InstrumentProvider } from "../../contexts/InstrumentContext/context"
import { useAuthUser } from "../../contexts/UserContext/context"
import { buy, quickBuy, sell, quickSell } from "../../api/transaction/trades"
import { Instrument as InstrumentType } from "../../api/instrument/types"
import { LoaderIds } from "../../router"
import { useInstrumentsQuery } from "../../contexts/QueryContext/instrument/hooks"

export default function Instrument() {
    const { id } = useParams()
    const { userId } = useAuthUser()
    const instrumentData = useRouteLoaderData(
        LoaderIds.instruments
    ) as InstrumentType[]

    const instruments = useInstrumentsQuery(userId, instrumentData)
        .data as InstrumentType[]

    const instrument = instruments.find((x) => x.id == id)

    if (instrument === undefined) {
        return <Navigate to="/instruments" />
    }

    return (
        <InstrumentProvider
            userId={userId}
            instrument={instrument}
            quickBuyHandler={quickBuy}
            quickSellHandler={quickSell}
            sellHandler={sell}
            buyHandler={buy}
        >
            <Grid2 container rowSpacing={3}>
                <Grid2 size={{ xs: 12, md: 10 }} offset={{ md: 1 }}>
                    <FullInstrumentCard />
                </Grid2>
                <Grid2 size={{ xs: 12, md: 10 }} offset={{ md: 1 }}>
                    <InstrumentTransactions />
                </Grid2>
            </Grid2>
        </InstrumentProvider>
    )
}
