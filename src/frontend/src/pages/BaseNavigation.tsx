import React from "react"
import { Navigate } from "react-router"
import { useAuth } from "../contexts/AuthContext/context"

export default function BaseNavigation() {
    const { isLoggedIn } = useAuth()
    const path = isLoggedIn ? "/home" : "/login"

    return <Navigate to={path} />
}
