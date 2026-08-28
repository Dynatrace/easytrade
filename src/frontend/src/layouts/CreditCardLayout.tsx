import React, { useEffect } from "react"
import { Navigate, Outlet, useLoaderData, useLocation } from "react-router"
import { useAuthUser } from "../contexts/UserContext/context"
import { OrderStatusResponse } from "../api/creditCard/order"
import { useCreditCardOrderStatus } from "../contexts/QueryContext/creditCard/hooks"
import { useToast } from "../contexts/ToastContext/context"

export default function CreditCardLayout() {
    const { userId } = useAuthUser()
    const orderStatus: OrderStatusResponse = useLoaderData()
    const { data } = useCreditCardOrderStatus(userId, orderStatus)
    const { showToast } = useToast()
    const { pathname } = useLocation()

    // Show a non-blocking toast when the status check fails and fall through
    // to the order page — don't crash the whole section for a transient error
    useEffect(() => {
        if (data?.type === "error") {
            showToast(
                `Credit card status unavailable: ${data.error}`,
                "error"
            )
        }
    }, [data?.type === "error"])  // eslint-disable-line react-hooks/exhaustive-deps

    if (data === undefined || data.type === "error") {
        // Status check failed — still allow access to the order page
        if (!pathname.includes("order")) {
            return <Navigate to="/credit-card/order" />
        }
        return <Outlet />
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
