import type { RouteObject } from "react-router"
import CreditCardLayout from "../layouts/CreditCardLayout"
import {creditCardStatusHistoryLoader, creditCardStatusLoader} from "../hooks/useCreditCard"
import { LoaderIds } from "../utils/routeIds"
import { lazyPage } from "./helpers"

export const creditCardRoutes: RouteObject = {
    path: "credit-card",
    element: <CreditCardLayout />,
    id: LoaderIds.creditCard,
    loader: creditCardStatusLoader,
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
            loader: creditCardStatusHistoryLoader,
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
