import type { RouteObject } from "react-router"
import CreditCardLayout from "../layouts/CreditCardLayout"
import { queryClient } from "../contexts/QueryContext/QueryContext"
import { sessionUserProvider } from "../contexts/QueryContext/user/loaders"
import { loadWithUser } from "../contexts/QueryContext/user/loaders"
import {
    creditCardStatusHistoryLoader,
    creditCardStatusLoader,
} from "../contexts/QueryContext/creditCard/loaders"
import { getOrderStatus, getOrderStatusHistory } from "../api/creditCard/order"
import { LoaderIds } from "../routeIds"
import { lazyPage } from "./helpers"

export const creditCardRoutes: RouteObject = {
    path: "credit-card",
    element: <CreditCardLayout />,
    id: LoaderIds.creditCard,
    loader: loadWithUser(
        sessionUserProvider,
        creditCardStatusLoader(queryClient, getOrderStatus)
    ),
    children: [
        {
            path: "order",
            lazy: lazyPage(
                () => import("../pages/protected/creditCard/CreditCardOrder")
            ),
        },
        {
            path: "status",
            id: LoaderIds.creditCardStatusHistory,
            loader: loadWithUser(
                sessionUserProvider,
                creditCardStatusHistoryLoader(
                    queryClient,
                    getOrderStatusHistory
                )
            ),
            lazy: lazyPage(
                () => import("../pages/protected/creditCard/CreditCardStatus")
            ),
        },
        {
            path: "active",
            lazy: lazyPage(
                () => import("../pages/protected/creditCard/CreditCardActive")
            ),
        },
    ],
}
