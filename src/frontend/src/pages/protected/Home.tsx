import React from "react"
import { Container, Stack } from "@mui/material"
import AccountInfo from "../../components/AccountInfo"
import InstrumentsTable from "../../components/InstrumentsTable"
import TransactionsTable from "../../components/TransactionsTable"
import { useTransactionQuery } from "../../contexts/QueryContext/transaction/hooks"
import { useInstrumentsQuery } from "../../contexts/QueryContext/instrument/hooks"
import { useLoaderData, useRouteLoaderData } from "react-router"
import { Instrument } from "../../api/instrument/types"
import { useAuthUser } from "../../contexts/UserContext/context"
import { Transaction } from "../../api/transaction/types"
import { LoaderIds } from "../../router"
import InstrumentsChart from "../../components/charts/InstrumentsChart"
import TransactionsCharts from "../../components/charts/TransactionsCharts"

export default function Home() {
    const { userId } = useAuthUser()
    const transactionData: Transaction[] = useLoaderData()
    const transactionsData = useTransactionQuery(userId, transactionData)
    const instrumentData = useRouteLoaderData(
        LoaderIds.instruments
    ) as Instrument[]
    const instruments = useInstrumentsQuery(userId, instrumentData)
        .data as Instrument[]

    return (
        <Container>
            <Stack spacing={2}>
                <AccountInfo />
                <InstrumentsChart instruments={instruments} />
                <InstrumentsTable instruments={instruments} />
                <TransactionsCharts
                    transactions={transactionsData.data ?? []}
                />
                <TransactionsTable
                    transactions={transactionsData.data ?? []}
                    instruments={instruments}
                />
            </Stack>
        </Container>
    )
}
