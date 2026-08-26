import React from "react"
import Logo from "./Logo"
import UserPanel from "./UserPanel"
import { useAuth } from "../../contexts/AuthContext/context"
import FeatureFlagIcon from "./FeatureFlagIcon"
import VersionInfo from "../version/VersionInfo"

export default function AppHeader() {
    const { isLoggedIn } = useAuth()
    return (
        <header className="app-header">
            <div className="app-header-left">
                <Logo />
            </div>
            <div className="app-header-right">
                <FeatureFlagIcon />
                <VersionInfo />
                {isLoggedIn && <UserPanel />}
            </div>
        </header>
    )
}
