import { Navigate, Outlet, useLoaderData } from "react-router"
import { useAuthUser } from "../contexts/UserContext/context"
import { OrderStatusResponse } from "../api/creditCard/order"
import { useCreditCardOrderStatus } from "../contexts/QueryContext/creditCard/hooks"
import { useLocation } from "react-router"

export default function CreditCardLayout() {
    const { userId } = useAuthUser()
    const orderStatus: OrderStatusResponse = useLoaderData()
    const { data } = useCreditCardOrderStatus(userId, orderStatus)
    const { pathname } = useLocation()

    if (data === undefined) {
        return null
    }

    if (data.type === "error") {
        throw new Error(data.error)
    }

    if (data.type === "not_found" && !pathname.includes("order")) {
        return <Navigate to="/credit-card/order" />
    }
    if (data.type === "success") {
        if (data.status === "card_delivered" && !pathname.includes("active")) {
            return <Navigate to="/credit-card/active" />
        }
        if (data.status !== "card_delivered" && !pathname.includes("status")) {
            return <Navigate to="/credit-card/status" />
        }
    }

    return <Outlet />
}
