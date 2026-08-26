import React from "react"
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

    if (data === undefined || data.type === "error") {
        throw new Error(
            `There was an error getting order history [${data?.error ?? "Response was empty"}]`
        )
    }

    return (
        <div className="card" style={{ padding: "1rem" }}>
            <CreditCardsStatusTimeline data={data} />
        </div>
    )
}
