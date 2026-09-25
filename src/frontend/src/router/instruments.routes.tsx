import type { RouteObject } from "react-router"
import { queryClient } from "../contexts/QueryContext/QueryContext"
import {
    loadWithUser,
    sessionUserProvider,
} from "../contexts/QueryContext/user/loaders"
import { instrumentsLoader } from "../contexts/QueryContext/instrument/loaders"
import { instrumentPricesLoader } from "../contexts/QueryContext/price/loaders"
import { transactionsLoader } from "../contexts/QueryContext/transaction/loaders"
import { getInstruments } from "../api/instrument/instruments"
import { getPricesForInstrument } from "../api/price/price"
import { getTransactions } from "../api/transaction/transactions"
import { LoaderIds } from "../routeIds"
import { lazyPage } from "./helpers"

export const instrumentsRoutes: RouteObject = {
    id: LoaderIds.instruments,
    loader: loadWithUser(
        sessionUserProvider,
        instrumentsLoader(queryClient, getInstruments)
    ),
    children: [
        {
            path: "home",
            id: LoaderIds.transactions,
            loader: loadWithUser(
                sessionUserProvider,
                transactionsLoader(queryClient, getTransactions)
            ),
            lazy: lazyPage(() => import("../pages/protected/Home")),
        },
        {
            path: "instruments",
            children: [
                {
                    index: true,
                    lazy: lazyPage(
                        () => import("../pages/protected/Instruments")
                    ),
                },
                {
                    path: ":id",
                    id: LoaderIds.prices,
                    loader: ({ params }) =>
                        instrumentPricesLoader(
                            queryClient,
                            getPricesForInstrument
                        )(params.id as string),
                    lazy: lazyPage(
                        () => import("../pages/protected/Instrument")
                    ),
                },
            ],
        },
    ],
}
