import React from "react"
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

// TODO (Stage 12): add portfolio-value-over-time chart here using lightweight-charts
// Endpoint: GET /broker-service/v1/portfolio/history/{accountId}?period=1d

export default function Home() {
    const { userId } = useAuthUser()
    const transactionData: Transaction[] = useLoaderData()
    const transactionsData = useTransactionQuery(userId, transactionData)
    const instrumentData = useRouteLoaderData(LoaderIds.instruments) as Instrument[]
    const instruments = useInstrumentsQuery(userId, instrumentData).data as Instrument[]

    return (
        <div className="form" style={{ gap: "var(--space-8)" }}>
            <AccountInfo />
            <InstrumentsTable instruments={instruments ?? []} />
            <TransactionsTable
                transactions={transactionsData.data ?? []}
                instruments={instruments ?? []}
            />
        </div>
    )
}
