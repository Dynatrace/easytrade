import React from "react"
import AccountInfo from "../../components/AccountInfo"
import InstrumentsTable from "../../components/InstrumentsTable"
import TransactionsTable from "../../components/TransactionsTable"
import InstrumentsChart from "../../components/charts/InstrumentsChart"
import { useTransactionQuery } from "../../contexts/QueryContext/transaction/hooks"
import { useInstrumentsQuery } from "../../contexts/QueryContext/instrument/hooks"
import { useLoaderData, useRouteLoaderData } from "react-router"
import { Instrument } from "../../api/instrument/types"
import { useAuthUser } from "../../contexts/UserContext/context"
import { Transaction } from "../../api/transaction/types"
import { LoaderIds } from "../../router"

export default function Home() {
    const { userId } = useAuthUser()
    const transactionData: Transaction[] = useLoaderData()
    const transactionsData = useTransactionQuery(userId, transactionData)
    const instrumentData = useRouteLoaderData(LoaderIds.instruments) as Instrument[]
    const instruments = useInstrumentsQuery(userId, instrumentData).data as Instrument[]

    return (
        <div className="form" style={{ gap: "var(--space-8)" }}>
            <AccountInfo />
            <InstrumentsChart accountId={userId} />
            <InstrumentsTable instruments={instruments ?? []} />
            <TransactionsTable
                transactions={transactionsData.data ?? []}
                instruments={instruments ?? []}
            />
        </div>
    )
}
