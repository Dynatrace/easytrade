import React from "react"
import { Navigate, Outlet } from "react-router"
import { useAuth } from "../contexts/AuthContext/context"

export default function PublicLayout() {
    const { isLoggedIn } = useAuth()
    return isLoggedIn ? (
        <Navigate to="/home" />
    ) : (
        <div className="public-page">
            <Outlet />
        </div>
    )
}
