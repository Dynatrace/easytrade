import React from "react"
import { AppBar, Divider, IconButton, Stack, Toolbar } from "@mui/material"
import Logo from "./Logo"
import { ThemeSwitcher } from "../ThemeSwitcher"
import UserPanel from "./UserPanel"
import { useAuth } from "../../contexts/AuthContext/context"
import FeatureFlag from "./FeatureFlagIcon"
import MenuIcon from "@mui/icons-material/Menu"
import { useNavigation } from "../../contexts/NavigationContext/context"
import VersionInfo from "../version/VersionInfo"

export default function AppHeader() {
    const { isLoggedIn } = useAuth()
    const { toggleNavigation } = useNavigation()
    return (
        <AppBar
            position="sticky"
            sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}
        >
            <Toolbar>
                <Stack
                    sx={{ width: "100%" }}
                    direction="row"
                    alignItems="center"
                    justifyContent="space-between"
                >
                    <Stack
                        direction="row"
                        alignItems="center"
                        divider={<Divider orientation="vertical" flexItem />}
                        spacing={2}
                    >
                        <Stack direction="row" alignItems="center">
                            {isLoggedIn && (
                                <IconButton
                                    id="navigationToggler"
                                    size="large"
                                    edge="start"
                                    color="inherit"
                                    onClick={toggleNavigation}
                                >
                                    <MenuIcon />
                                </IconButton>
                            )}
                            <Logo />
                        </Stack>
                        <Stack direction="row" alignItems="center" spacing={1}>
                            <ThemeSwitcher />
                            <FeatureFlag />
                            <VersionInfo />
                        </Stack>
                    </Stack>
                    {isLoggedIn && <UserPanel />}
                </Stack>
            </Toolbar>
        </AppBar>
    )
}
