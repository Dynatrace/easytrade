import React from "react"
import { PropsWithChildren, createContext, useContext } from "react"
import { IInstrumentContext, InstrumentProviderProps } from "./types"

const InstrumentContext = createContext<IInstrumentContext | undefined>(
    undefined
)

export function InstrumentProvider({
    instrument,
    userId,
    quickBuyHandler,
    quickSellHandler,
    buyHandler,
    sellHandler,
    children,
}: PropsWithChildren<InstrumentProviderProps>) {
    return (
        <InstrumentContext.Provider
            value={{
                instrument,
                quickBuyHandler: async (amount: number) =>
                    await quickBuyHandler(userId, instrument.id, amount),
                quickSellHandler: async (amount: number) =>
                    await quickSellHandler(userId, instrument.id, amount),
                buyHandler: async (
                    amount: number,
                    price: number,
                    time: number
                ) =>
                    await buyHandler(
                        userId,
                        instrument.id,
                        amount,
                        price,
                        time
                    ),
                sellHandler: async (
                    amount: number,
                    price: number,
                    time: number
                ) =>
                    await sellHandler(
                        userId,
                        instrument.id,
                        amount,
                        price,
                        time
                    ),
            }}
        >
            {children}
        </InstrumentContext.Provider>
    )
}

export function useInstrument() {
    const context = useContext(InstrumentContext)
    if (context === undefined) {
        throw new Error(
            "Components using [userInstrument] hook need to be wrapped in [InstrumentProvider]"
        )
    }
    return context
}
