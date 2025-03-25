import React from "react"
import { Box } from "@mui/material"
import { Navigate, Outlet } from "react-router"
import { useAuth } from "../contexts/AuthContext/context"

export default function PublicLayout() {
    const { isLoggedIn } = useAuth()
    return isLoggedIn ? (
        <Navigate to={"/home"} />
    ) : (
        <Box sx={{ display: "static" }}>
            <Outlet />
        </Box>
    )
}
