import { useRouteLoaderData } from "react-router"
import { LoaderIds } from "../../../router"
import { OrderStatusHistoryResponse } from "../../../api/creditCard/order"
import { useCreditCardOrderStatusHistory } from "../../../contexts/QueryContext/creditCard/hooks"
import { useAuthUser } from "../../../contexts/UserContext/context"
import CreditCardsStatusTimeline from "../../../components/creditCard/CreditCardStatusTimeline"

export default function CreditCardStatus() {
    const loaderData = useRouteLoaderData(LoaderIds.creditCardStatusHistory) as OrderStatusHistoryResponse
    const { userId } = useAuthUser()
    const { data } = useCreditCardOrderStatusHistory(userId, loaderData)

    if (data === undefined) {
        return (
            <div className="page-centered">
                <div className="card" style={{ padding: "1rem", minWidth: 400 }}>
                    <p className="empty-state">Loading order history…</p>
                </div>
            </div>
        )
    }

    if (data.type === "error") {
        return (
            <div className="page-centered">
                <div className="card" style={{ padding: "1rem", minWidth: 400 }}>
                    <div className="status-message status-error">
                        Could not load order history: {data.error}
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="page-centered">
            <div className="card" style={{ padding: "1.5rem", minWidth: 400, width: "100%", maxWidth: 600 }}>
                <CreditCardsStatusTimeline data={data} />
            </div>
        </div>
    )
}
