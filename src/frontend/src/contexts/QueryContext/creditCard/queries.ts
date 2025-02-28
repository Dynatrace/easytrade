import { QueryClient, QueryFunction } from "@tanstack/react-query"
import {
    OrderStatusHistoryResponse,
    OrderStatusResponse,
} from "../../../api/creditCard/order"
import { QueryParams } from "../types"

export const creditCardKeys = {
    all: ["credit-card"] as const,
    status: ["credit-card", "status"] as const,
    history: ["credit-card", "status", "history"] as const,
}

export function creditCardStatusQuery(
    queryFn: QueryFunction<OrderStatusResponse>
): QueryParams<OrderStatusResponse> {
    return { queryKey: creditCardKeys.status, queryFn }
}

export function creditCardStatusHistoryQuery(
    queryFn: QueryFunction<OrderStatusHistoryResponse>
): QueryParams<OrderStatusHistoryResponse> {
    return { queryKey: creditCardKeys.history, queryFn }
}

export async function newCardOrderInvalidateQuery(client: QueryClient) {
    await client.invalidateQueries({ queryKey: creditCardKeys.status })
}

export async function deleteCardInvalidateQuery(client: QueryClient) {
    await client.invalidateQueries({ queryKey: creditCardKeys.status })
}
