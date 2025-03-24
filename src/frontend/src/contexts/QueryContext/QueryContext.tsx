import React from "react"
import { createContext, PropsWithChildren, useContext } from "react"
import {
    QueryClient,
    QueryClientProvider as BaseClientProvider,
    QueryFunction,
} from "@tanstack/react-query"
import { IQueryContext, QueryProviderProps } from "./types"

const QueryContext = createContext<IQueryContext | null>(null)
const queryClient = new QueryClient({
    defaultOptions: {
        queries: { staleTime: 60 * 1000 },
    },
})

function useQueryContext() {
    const context = useContext(QueryContext)

    if (context === null) {
        throw new Error(
            "Components using [useQueryContext] hook need to be wrapped in [QueryClientProvider]"
        )
    }

    return context
}

function transform<TParams, TResult>(
    fn: (params: TParams) => Promise<TResult>
): (params: TParams) => QueryFunction<TResult> {
    return (params: TParams) => () => fn(params)
}

function QueryClientProvider({
    getUser,
    getBalance,
    getTransactions,
    getInstruments,
    getCreditCardStatus,
    getCreditCardStatusHistory,
    getInstrumentPrices,
    children,
    ...rest
}: PropsWithChildren<QueryProviderProps>) {
    return (
        <BaseClientProvider client={queryClient}>
            <QueryContext.Provider
                value={{
                    getUser: transform(getUser),
                    getBalance: transform(getBalance),
                    getTransactions: transform(getTransactions),
                    getInstruments: transform(getInstruments),
                    getCreditCardStatus: transform(getCreditCardStatus),
                    getCreditCardStatusHistory: transform(
                        getCreditCardStatusHistory
                    ),
                    getInstrumentPrices: transform(getInstrumentPrices),
                    ...rest,
                }}
            >
                {children}
            </QueryContext.Provider>
        </BaseClientProvider>
    )
}

export { queryClient, QueryClientProvider, useQueryContext, transform }
