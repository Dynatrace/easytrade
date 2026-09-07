import React from "react"
import AppHeader from "../components/AppHeader/AppHeader"
import { Outlet } from "react-router"

export default function AppLayout() {
    return (
        <div className="page-outer" data-dt-properties="theme:dark">
            <AppHeader />
            <div className="page-body">
                <Outlet />
            </div>
        </div>
    )
}
