import React from "react"
import { CssBaseline } from "@mui/material"
import { login, logout } from "../api/login/login"
import { getTransactions } from "../api/transaction/transactions"
import { getBalance, getPresetUsers, getUser } from "../api/user/user"
import { AuthProvider } from "../contexts/AuthContext"
import { QueryClientProvider } from "../contexts/QueryContext/QueryContext"
import { getPreferredTheme } from "../contexts/ThemeContext/theme"
import { ThemeProvider } from "../contexts/ThemeContext/ThemeContext"
import { getInstruments } from "../api/instrument/instruments"
import { getPricesForInstrument, getLatestPrices } from "../api/price/price"
import { FormatterProvider } from "../contexts/FormatterContext/context"
import { getFeatureFlags } from "../api/featureFlags/problemPatterns"
import { ReactQueryDevtools } from "@tanstack/react-query-devtools"
import { NavigationProvider } from "../contexts/NavigationContext/context"
import { getConfig } from "../api/featureFlags/config"
import { getOrderStatus, getOrderStatusHistory } from "../api/creditCard/order"
import { getAllVersions } from "../api/version/versions"
import AppLayout from "./AppLayout"

export default function ProviderLayout() {
    return (
        <FormatterProvider currency="USD" locale="en-US">
            <QueryClientProvider
                getUser={getUser}
                getBalance={getBalance}
                getPresetUsers={getPresetUsers}
                getTransactions={getTransactions}
                getInstruments={getInstruments}
                getLatestPrices={getLatestPrices}
                getFeatureFlags={getFeatureFlags}
                getConfig={getConfig}
                getCreditCardStatus={getOrderStatus}
                getCreditCardStatusHistory={getOrderStatusHistory}
                getInstrumentPrices={getPricesForInstrument}
                getVersions={getAllVersions}
            >
                <ThemeProvider initialTheme={getPreferredTheme()}>
                    <AuthProvider loginHandler={login} logoutHandler={logout}>
                        <NavigationProvider initialNavigationState={true}>
                            <CssBaseline />
                            <AppLayout />
                        </NavigationProvider>
                        <ReactQueryDevtools initialIsOpen={false} />
                    </AuthProvider>
                </ThemeProvider>
            </QueryClientProvider>
        </FormatterProvider>
    )
}
