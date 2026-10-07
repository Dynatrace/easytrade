import { Navigate, useParams } from "react-router"
import FullInstrumentCard from "../../components/instrument/FullInstrumentCard"
import InstrumentTransactions from "../../components/instrument/InstrumentTransactions"
import { InstrumentProvider } from "../../contexts/InstrumentContext/context"
import { useAuthUser } from "../../contexts/UserContext/context"
import { buy, quickBuy, sell, quickSell } from "../../api/transaction"
import { useInstrumentsQuery } from "../../hooks/useInstruments"
import { PageSpinner } from "../../components/PageSpinner"

export default function Instrument() {
    const { id } = useParams()
    const { userId } = useAuthUser()
    const { data: instruments, isError } = useInstrumentsQuery(userId)

    if (isError) {
        return (
            <div className="page-centered">
                <span className="status-message status-error">
                    Could not load instruments.
                </span>
            </div>
        )
    }

    if (instruments === undefined) {
        return <PageSpinner />
    }

    const instrument = instruments.find((x) => x.id === id)

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
            <div className="instrument-page-layout">
                <FullInstrumentCard />
                <InstrumentTransactions />
            </div>
        </InstrumentProvider>
    )
}
