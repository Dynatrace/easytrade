import { PropsWithChildren } from "react"
import { QueryClientProvider } from "../contexts/QueryContext/QueryContext"
import { UserContextProvider } from "../contexts/UserContext/context"
import { FormatterProvider } from "../contexts/FormatterContext/context"
import { QueryProviderProps } from "../contexts/QueryContext/types"

export function QueryClientWrapper({
    getUser,
    children,
}: PropsWithChildren<Partial<QueryProviderProps>>) {
    return (
        <QueryClientProvider
            getUser={async (userId: string) => ({
                id: userId,
                firstName: "First",
                lastName: "Last",
                email: "test@email.com",
                packageType: "1",
                address: "test address 123",
            })}
            getBalance={async (userId: string) => ({
                accountId: userId,
                value: 123,
            })}
            getPresetUsers={vi.fn()}
            getTransactions={vi.fn()}
            getInstruments={vi.fn()}
            getInstrumentPrices={vi.fn()}
            getLatestPrices={vi.fn()}
            getFeatureFlags={vi.fn()}
            getConfig={vi.fn()}
            getCreditCardStatus={vi.fn()}
            getCreditCardStatusHistory={vi.fn()}
            getVersions={vi.fn()}
        >
            {children}
        </QueryClientProvider>
    )
}

export function UserContextWrapper({ children }: PropsWithChildren) {
    return (
        <UserContextProvider userId={"1"} logoutHandler={vi.fn()}>
            {children}
        </UserContextProvider>
    )
}

export function FormatterWrapper({ children }: PropsWithChildren) {
    return (
        <FormatterProvider locale={"en-US"} currency={"USD"}>
            {children}
        </FormatterProvider>
    )
}
