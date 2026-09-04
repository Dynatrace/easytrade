import React from "react"
import { login } from "../api/login/login"
import { getTransactions } from "../api/transaction/transactions"
import { getBalance, getPresetUsers, getUser } from "../api/user/user"
import { AuthProvider } from "../contexts/AuthContext"
import { QueryClientProvider } from "../contexts/QueryContext/QueryContext"
import { getInstruments } from "../api/instrument/instruments"
import { getPricesForInstrument } from "../api/price/price"
import { FormatterProvider } from "../contexts/FormatterContext/context"
import { getFeatureFlags } from "../api/featureFlags/problemPatterns"
import { getConfig } from "../api/featureFlags/config"
import { getOrderStatus, getOrderStatusHistory } from "../api/creditCard/order"
import { getAllVersions } from "../api/version/versions"
import AppLayout from "./AppLayout"
import { ToastProvider } from "../contexts/ToastContext/context"

export default function ProviderLayout() {
    return (
        <FormatterProvider currency="USD" locale="en-US">
            <ToastProvider>
            <QueryClientProvider
                getUser={getUser}
                getBalance={getBalance}
                getPresetUsers={getPresetUsers}
                getTransactions={getTransactions}
                getInstruments={getInstruments}
                getFeatureFlags={getFeatureFlags}
                getConfig={getConfig}
                getCreditCardStatus={getOrderStatus}
                getCreditCardStatusHistory={getOrderStatusHistory}
                getInstrumentPrices={getPricesForInstrument}
                getVersions={getAllVersions}
            >
                <AuthProvider loginHandler={login}>
                    <AppLayout />
                </AuthProvider>
            </QueryClientProvider>
            </ToastProvider>
        </FormatterProvider>
    )
}
