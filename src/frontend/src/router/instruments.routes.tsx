import type { RouteObject } from "react-router"
import { LoaderIds } from "../utils/routeIds"
import { lazyPage } from "./helpers"
import { instrumentsLoader } from "../hooks/useInstruments"
import { transactionsLoader } from "../hooks/useTransactions"

export const instrumentsRoutes: RouteObject = {
    id: LoaderIds.instruments,
    loader: instrumentsLoader,
    children: [
        {
            path: "home",
            id: LoaderIds.transactions,
            loader: transactionsLoader,
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
                    lazy: lazyPage(
                        () => import("../pages/protected/Instrument")
                    ),
                },
            ],
        },
    ],
}
