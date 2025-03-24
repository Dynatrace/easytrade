import React from "react"
import { Navigate, Outlet, useLoaderData, useLocation } from "react-router"
import { useAuthUser } from "../contexts/UserContext/context"
import { OrderStatusResponse } from "../api/creditCard/order"
import { useCreditCardOrderStatus } from "../contexts/QueryContext/creditCard/hooks"
import { Box } from "@mui/material"

export default function CreditCardLayout() {
    const { userId } = useAuthUser()
    const orderStatus: OrderStatusResponse = useLoaderData()
    const { data } = useCreditCardOrderStatus(userId, orderStatus)

    const { pathname } = useLocation()

    if (data === undefined || data.type === "error") {
        throw new Error(
            data?.error ?? "Couldn't get data for credit card order status."
        )
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

    return (
        <Box sx={{ display: "flex", m: "auto" }}>
            <Outlet />
        </Box>
    )
}
