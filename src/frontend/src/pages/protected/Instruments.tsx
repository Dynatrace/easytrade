import InstrumentsGrid from "../../components/instrument/InstrumentsGrid"
import { useAuthUser } from "../../contexts/UserContext/context"
import { useInstrumentsQuery } from "../../hooks/useInstruments"

export default function InstrumentsPage() {
    const { userId } = useAuthUser()
    const { data: instruments } = useInstrumentsQuery(userId)

    return (
        <div>
            <div className="page-header">
                <h2>Instruments</h2>
            </div>
            <InstrumentsGrid instruments={instruments ?? []} />
        </div>
    )
}
