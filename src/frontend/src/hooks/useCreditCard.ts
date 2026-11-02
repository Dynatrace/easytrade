import { queryOptions, useQuery } from "@tanstack/react-query"
import {
    OrderStatusHistoryResponse,
    OrderStatusResponse,
    getOrderStatus,
    getOrderStatusHistory,
} from "../api/creditCard"
import { queryClient } from "../utils/queryClient"
import { creditCardKeys } from "../utils/queryKeys"
import { requireUser } from "./useUser"

export function creditCardStatusQuery(userId: string) {
    return queryOptions({
        queryKey: creditCardKeys.status,
        queryFn: () => getOrderStatus(userId),
    })
}

export function creditCardStatusHistoryQuery(userId: string) {
    return queryOptions({
        queryKey: creditCardKeys.history,
        queryFn: () => getOrderStatusHistory(userId),
    })
}

export function useCreditCardOrderStatus(
    userId: string,
    initialData?: OrderStatusResponse
) {
    return useQuery({ ...creditCardStatusQuery(userId), initialData })
}

export function useCreditCardOrderStatusHistory(
    userId: string,
    initialData?: OrderStatusHistoryResponse
) {
    return useQuery({ ...creditCardStatusHistoryQuery(userId), initialData })
}

export const creditCardStatusLoader = requireUser((userId) =>
    queryClient.ensureQueryData(creditCardStatusQuery(userId))
)

export const creditCardStatusHistoryLoader = requireUser((userId) =>
    queryClient.ensureQueryData(creditCardStatusHistoryQuery(userId))
)
