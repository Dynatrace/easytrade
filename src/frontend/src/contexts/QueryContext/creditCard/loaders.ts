import { QueryClient } from "@tanstack/react-query"
import {
    OrderStatusHistoryResponse,
    OrderStatusResponse,
} from "../../../api/creditCard/order"
import { transform } from "../QueryContext"
import { creditCardStatusHistoryQuery, creditCardStatusQuery } from "./queries"

export function creditCardStatusLoader(
    client: QueryClient,
    creditCardStatusProvider: (userId: string) => Promise<OrderStatusResponse>
) {
    const queryFn = transform(creditCardStatusProvider)
    return async (userId: string) => {
        return await client.ensureQueryData(
            creditCardStatusQuery(queryFn(userId))
        )
    }
}

export function creditCardStatusHistoryLoader(
    client: QueryClient,
    creditCardStatusHistoryProvider: (
        userId: string
    ) => Promise<OrderStatusHistoryResponse>
) {
    const queryFn = transform(creditCardStatusHistoryProvider)
    return async (userId: string) => {
        return await client.ensureQueryData(
            creditCardStatusHistoryQuery(queryFn(userId))
        )
    }
}
