import React, { lazy, Suspense } from "react"
import {
    createBrowserRouter,
    createRoutesFromElements,
    Route,
} from "react-router"
import ProviderLayout from "./layouts/ProviderLayout"
import ProtectedLayout from "./layouts/ProtectedLayout"
import PublicLayout from "./layouts/PublicLayout"
import CreditCardLayout from "./layouts/CreditCardLayout"
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
import { instrumentsLoader } from "./contexts/QueryContext/instrument/loaders"
import { getInstruments } from "./api/instrument/instruments"
import { instrumentPricesLoader } from "./contexts/QueryContext/price/loaders"
import { getPricesForInstrument } from "./api/price/price"
import { transactionsLoader } from "./contexts/QueryContext/transaction/loaders"
import { getTransactions } from "./api/transaction/transactions"
import {
    creditCardStatusHistoryLoader,
    creditCardStatusLoader,
} from "./contexts/QueryContext/creditCard/loaders"
import { getOrderStatus, getOrderStatusHistory } from "./api/creditCard/order"

// Route-based code splitting — each page loads its own JS chunk
const Login = lazy(() => import("./pages/public/Login"))
const Signup = lazy(() => import("./pages/public/Signup"))
const Home = lazy(() => import("./pages/protected/Home"))
const Deposit = lazy(() => import("./pages/protected/Deposit"))
const Withdraw = lazy(() => import("./pages/protected/Withdraw"))
const InstrumentsPage = lazy(() => import("./pages/protected/Instruments"))
const Instrument = lazy(() => import("./pages/protected/Instrument"))
const FeatureFlags = lazy(() => import("./pages/FeatureFlags"))
const Version = lazy(() => import("./pages/Version"))
const CreditCardOrder = lazy(() => import("./pages/protected/creditCard/CreditCardOrder"))
const CreditCardStatus = lazy(() => import("./pages/protected/creditCard/CreditCardStatus"))
const CreditCardActive = lazy(() => import("./pages/protected/creditCard/CreditCardActive"))

function Loading() {
    return (
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", padding: "4rem" }}>
            <span className="spinner" style={{ width: 32, height: 32 }} />
        </div>
    )
}

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
        <Route path="feature-flags" element={<Suspense fallback={<Loading />}><FeatureFlags /></Suspense>} />
        <Route path="version" element={<Suspense fallback={<Loading />}><Version /></Suspense>} />
        <Route element={<PublicLayout />}>
            <Route
                path="login"
                element={<Suspense fallback={<Loading />}><Login /></Suspense>}
                loader={presetUsersLoader(queryClient, getPresetUsers)}
            />
            <Route path="signup" element={<Suspense fallback={<Loading />}><Signup /></Suspense>} />
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
            <Route path="withdraw" element={<Suspense fallback={<Loading />}><Withdraw /></Suspense>} />
            <Route path="deposit" element={<Suspense fallback={<Loading />}><Deposit /></Suspense>} />
            <Route
                path="credit-card"
                element={<CreditCardLayout />}
                loader={loadWithUser(
                    sessionUserProvider,
                    creditCardStatusLoader(queryClient, getOrderStatus)
                )}
                id={LoaderIds.creditCard}
            >
                <Route path="order" element={<Suspense fallback={<Loading />}><CreditCardOrder /></Suspense>} />
                <Route
                    path="status"
                    element={<Suspense fallback={<Loading />}><CreditCardStatus /></Suspense>}
                    loader={loadWithUser(
                        sessionUserProvider,
                        creditCardStatusHistoryLoader(
                            queryClient,
                            getOrderStatusHistory
                        )
                    )}
                    id={LoaderIds.creditCardStatusHistory}
                />
                <Route path="active" element={<Suspense fallback={<Loading />}><CreditCardActive /></Suspense>} />
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
                    element={<Suspense fallback={<Loading />}><Home /></Suspense>}
                    loader={loadWithUser(
                        sessionUserProvider,
                        transactionsLoader(queryClient, getTransactions)
                    )}
                    id={LoaderIds.transactions}
                />
                <Route path="instruments">
                    <Route index element={<Suspense fallback={<Loading />}><InstrumentsPage /></Suspense>} />
                    <Route
                        path=":id"
                        element={<Suspense fallback={<Loading />}><Instrument /></Suspense>}
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
