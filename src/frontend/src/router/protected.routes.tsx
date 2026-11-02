import type { RouteObject } from "react-router"
import ProtectedLayout from "../layouts/ProtectedLayout"
import { LoaderIds } from "../utils/routeIds"
import { lazyPage } from "./helpers"
import { creditCardRoutes } from "./credit-card.routes"
import { instrumentsRoutes } from "./instruments.routes"
import { userAndBalanceLoader } from "../hooks/useUser"

export const protectedRoutes: RouteObject = {
    element: <ProtectedLayout />,
    id: LoaderIds.user,
    loader: userAndBalanceLoader,
    children: [
        {
            path: "withdraw",
            lazy: lazyPage(() => import("../pages/protected/Withdraw")),
        },
        {
            path: "deposit",
            lazy: lazyPage(() => import("../pages/protected/Deposit")),
        },
        creditCardRoutes,
        instrumentsRoutes,
    ],
}
