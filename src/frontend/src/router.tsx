import React from "react"
import {
    createBrowserRouter,
    createRoutesFromElements,
    Route,
} from "react-router"
import ProviderLayout from "./layouts/ProviderLayout"
import ProtectedLayout from "./layouts/ProtectedLayout"
import PublicLayout from "./layouts/PublicLayout"
import Login from "./pages/public/Login"
import Signup from "./pages/public/Signup"
import Home from "./pages/protected/Home"
import Deposit from "./pages/protected/Deposit"
import Withdraw from "./pages/protected/Withdraw"
import BaseNavigation from "./pages/BaseNavigation"
import { queryClient } from "./contexts/QueryContext/QueryContext"
import { getUser, getPresetUsers, getBalance } from "./api/user/user"
import ErrorPage from "./pages/ErrorPage"
import {
    loadWithUser,
    presetUsersLoader,
    sessionUserProvider,
    balanceLoader,
    userLoader,
} from "./contexts/QueryContext/user/loaders"
import InstrumentsPage from "./pages/protected/Instruments"
import Instrument from "./pages/protected/Instrument"
import { instrumentsLoader } from "./contexts/QueryContext/instrument/loaders"
import { getInstruments } from "./api/instrument/instruments"
import { instrumentPricesLoader } from "./contexts/QueryContext/price/loaders"
import { getPricesForInstrument } from "./api/price/price"
import { transactionsLoader } from "./contexts/QueryContext/transaction/loaders"
import { getTransactions } from "./api/transaction/transactions"
import FeatureFlags from "./pages/FeatureFlags"
import Version from "./pages/Version"
import {
    creditCardStatusHistoryLoader,
    creditCardStatusLoader,
} from "./contexts/QueryContext/creditCard/loaders"
import { getOrderStatus, getOrderStatusHistory } from "./api/creditCard/order"
import CreditCardLayout from "./layouts/CreditCardLayout"
import CreditCardOrder from "./pages/protected/creditCard/CreditCardOrder"
import CreditCardStatus from "./pages/protected/creditCard/CreditCardStatus"
import CreditCardActive from "./pages/protected/creditCard/CreditCardActive"

export enum LoaderIds {
    user = "user-loader",
    instruments = "instruments-loader",
    transactions = "transactions-loader",
    creditCard = "creditCard-loader",
    creditCardStatusHistory = "creditCardStatusHistory-loader",
    prices = "prices-loader",
}

const elementRoutes = createRoutesFromElements(
    <Route path="/" element={<ProviderLayout />} errorElement={<ErrorPage />}>
        <Route index element={<BaseNavigation />} />
        <Route path="*" element={<BaseNavigation />} />
        <Route path="feature-flags" element={<FeatureFlags />} />
        <Route path="version" element={<Version />} />
        <Route element={<PublicLayout />}>
            <Route
                path="login"
                element={<Login />}
                loader={presetUsersLoader(queryClient, getPresetUsers)}
            />
            <Route path="signup" element={<Signup />} />
        </Route>
        <Route
            element={<ProtectedLayout />}
            loader={async () => {
                return await Promise.all([
                    loadWithUser(
                        sessionUserProvider,
                        userLoader(queryClient, getUser)
                    ),
                    loadWithUser(
                        sessionUserProvider,
                        balanceLoader(queryClient, getBalance)
                    ),
                ])
            }}
            id={LoaderIds.user}
        >
            <Route path="withdraw" element={<Withdraw />} />
            <Route path="deposit" element={<Deposit />} />
            <Route
                path="credit-card"
                element={<CreditCardLayout />}
                loader={loadWithUser(
                    sessionUserProvider,
                    creditCardStatusLoader(queryClient, getOrderStatus)
                )}
                id={LoaderIds.creditCard}
            >
                <Route path="order" element={<CreditCardOrder />} />
                <Route
                    path="status"
                    element={<CreditCardStatus />}
                    loader={loadWithUser(
                        sessionUserProvider,
                        creditCardStatusHistoryLoader(
                            queryClient,
                            getOrderStatusHistory
                        )
                    )}
                    id={LoaderIds.creditCardStatusHistory}
                />
                <Route path="active" element={<CreditCardActive />} />
            </Route>
            <Route
                loader={loadWithUser(
                    sessionUserProvider,
                    instrumentsLoader(queryClient, getInstruments)
                )}
                id={LoaderIds.instruments}
            >
                <Route
                    path="home"
                    element={<Home />}
                    loader={loadWithUser(
                        sessionUserProvider,
                        transactionsLoader(queryClient, getTransactions)
                    )}
                    id={LoaderIds.transactions}
                />
                <Route path="instruments">
                    <Route index element={<InstrumentsPage />} />
                    <Route
                        path=":id"
                        element={<Instrument />}
                        loader={async ({ params }) => {
                            return await instrumentPricesLoader(
                                queryClient,
                                getPricesForInstrument
                            )(params.id as string)
                        }}
                        id={LoaderIds.prices}
                    />
                </Route>
            </Route>
        </Route>
    </Route>
)

export const router = createBrowserRouter(elementRoutes, {
    basename: import.meta.env.VITE_BASE_URL,
})
