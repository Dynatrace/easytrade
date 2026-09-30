import type { RouteObject } from "react-router"
import ProtectedLayout from "../layouts/ProtectedLayout"
import { queryClient } from "../contexts/QueryContext/QueryContext"
import {
    balanceLoader,
    loadWithUser,
    sessionUserProvider,
    userLoader,
} from "../contexts/QueryContext/user/loaders"
import { getBalance, getUser } from "../api/user/user"
import { LoaderIds } from "../routeIds"
import { lazyPage } from "./helpers"
import { creditCardRoutes } from "./credit-card.routes"
import { instrumentsRoutes } from "./instruments.routes"

export const protectedRoutes: RouteObject = {
    element: <ProtectedLayout />,
    id: LoaderIds.user,
    loader: () =>
        Promise.all([
            loadWithUser(
                sessionUserProvider,
                userLoader(queryClient, getUser)
            )(),
            loadWithUser(
                sessionUserProvider,
                balanceLoader(queryClient, getBalance)
            )(),
        ]),
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
