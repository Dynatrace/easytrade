import { useQuery } from "@tanstack/react-query"
import {
    OrderStatusHistoryResponse,
    OrderStatusResponse,
} from "../../../api/creditCard/order"
import { useQueryContext } from "../QueryContext"
import { creditCardStatusHistoryQuery, creditCardStatusQuery } from "./queries"

export function useCreditCardOrderStatus(
    userId: string,
    initialData?: OrderStatusResponse
) {
    const { getCreditCardStatus } = useQueryContext()
    return useQuery({
        ...creditCardStatusQuery(getCreditCardStatus(userId)),
        initialData,
    })
}

export function useCreditCardOrderStatusHistory(
    userId: string,
    initialData?: OrderStatusHistoryResponse
) {
    const { getCreditCardStatusHistory } = useQueryContext()
    return useQuery({
        ...creditCardStatusHistoryQuery(getCreditCardStatusHistory(userId)),
        initialData,
    })
}
