import AccountInfo from "../../components/AccountInfo"
import InstrumentsTable from "../../components/InstrumentsTable"
import TransactionsTable from "../../components/TransactionsTable"
import InstrumentsChart from "../../components/charts/InstrumentsChart"
import { useTransactionQuery } from "../../hooks/useTransactions"
import { useInstrumentsQuery } from "../../hooks/useInstruments"
import { useAuthUser } from "../../contexts/UserContext/context"

export default function Home() {
    const { userId } = useAuthUser()
    const { data: transactions } = useTransactionQuery(userId)
    const { data: instruments } = useInstrumentsQuery(userId)

    return (
        <div className="form" style={{ gap: "var(--space-8)" }}>
            <AccountInfo />
            <InstrumentsChart accountId={userId} />
            <InstrumentsTable instruments={instruments ?? []} />
            <TransactionsTable
                transactions={transactions ?? []}
                instruments={instruments ?? []}
            />
        </div>
    )
}
