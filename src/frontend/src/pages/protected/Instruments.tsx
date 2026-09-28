import InstrumentsGrid from "../../components/instrument/InstrumentsGrid"
import { useAuthUser } from "../../contexts/UserContext/context"
import { useRouteLoaderData } from "react-router"
import { Instrument } from "../../api/instrument"
import { LoaderIds } from "../../utils/routeIds"
import { useInstrumentsQuery } from "../../hooks/useInstruments"

export default function InstrumentsPage() {
    const { userId } = useAuthUser()
    const instrumentData = useRouteLoaderData(LoaderIds.instruments) as Instrument[]
    const instruments = useInstrumentsQuery(userId, instrumentData).data as Instrument[]

    return (
        <div>
            <div className="page-header">
                <h2>Instruments</h2>
            </div>
            <InstrumentsGrid instruments={instruments ?? []} />
        </div>
    )
}
