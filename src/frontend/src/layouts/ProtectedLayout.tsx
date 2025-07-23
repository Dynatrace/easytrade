import React from "react"
import { Box, useMediaQuery, useTheme } from "@mui/material"
import { Navigate, Outlet } from "react-router"
import Navigation from "../components/Navigation"
import { useAuth } from "../contexts/AuthContext/context"
import { UserContextProvider } from "../contexts/UserContext/context"
import Grid2 from "@mui/material/Grid2"
import { useNavigation } from "../contexts/NavigationContext/context"
import { useEffect } from "react"

export default function ProtectedLayout() {
    const { userId, isLoggedIn, logoutHandler } = useAuth()
    const { navigationVisible, hideNavigation } = useNavigation()
    const theme = useTheme()
    const navigationHidden = useMediaQuery(theme.breakpoints.down("md"))

    useEffect(() => {
        if (navigationHidden) {
            hideNavigation()
        }
    }, [navigationHidden])

    if (!isLoggedIn) {
        return <Navigate to="/login" />
    }

    return (
        <UserContextProvider userId={userId} logoutHandler={logoutHandler}>
            <Box sx={{ display: "static" }}>
                <Navigation />
                <Grid2
                    container
                    sx={{ ml: navigationVisible ? "210px" : "0px" }}
                >
                    <Outlet />
                </Grid2>
            </Box>
        </UserContextProvider>
    )
}
