import { Navigate, Outlet, useLoaderData, useLocation } from "react-router"
import { useAuthUser } from "../contexts/UserContext/context"
import { OrderStatusResponse } from "../api/creditCard"
import { useCreditCardOrderStatus } from "../hooks/useCreditCard"
import { PageSpinner } from "../components/PageSpinner"

export default function CreditCardLayout() {
    const { userId } = useAuthUser()
    const orderStatus: OrderStatusResponse = useLoaderData()
    const { data } = useCreditCardOrderStatus(userId, orderStatus)
    const { pathname } = useLocation()

    if (data === undefined) {
        return <PageSpinner />
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
