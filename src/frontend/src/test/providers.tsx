import { PropsWithChildren, useState } from "react"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { UserContextProvider } from "../contexts/UserContext/context"
import { FormatterProvider } from "../contexts/FormatterContext/context"
import { balanceKeys, userKeys } from "../utils/queryKeys"


const TEST_USER_ID = "1"

export function QueryClientWrapper({ children }: PropsWithChildren) {
    const [client] = useState(() => {
        const client = new QueryClient({
            defaultOptions: {
                queries: { retry: false, staleTime: Infinity },
            },
        })
        client.setQueryData(userKeys.byId(TEST_USER_ID), {
            id: TEST_USER_ID,
            firstName: "First",
            lastName: "Last",
            email: "test@email.com",
            packageType: "1",
            address: "test address 123",
        })
        client.setQueryData(balanceKeys.byId(TEST_USER_ID), {
            accountId: TEST_USER_ID,
            value: 123,
        })
        return client
    })
    return <QueryClientProvider client={client}>{children}</QueryClientProvider>
}

export function UserContextWrapper({ children }: PropsWithChildren) {
    return (
        <UserContextProvider userId={TEST_USER_ID} logoutHandler={vi.fn()}>
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
