import AppHeader from "../components/AppHeader/AppHeader"
import { Outlet } from "react-router"

export default function AppLayout() {
    return (
        <div className="page-outer">
            <AppHeader />
            <div className="page-body">
                <Outlet />
            </div>
        </div>
    )
}
