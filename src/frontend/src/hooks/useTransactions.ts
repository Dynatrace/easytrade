import { queryOptions, useQuery } from "@tanstack/react-query"
import { Transaction, getTransactions } from "../api/transaction"
import { queryClient } from "../utils/queryClient"
import { transactionKeys } from "../utils/queryKeys"
import { requireUser } from "./useUser"

export function transactionsQuery(userId: string) {
    return queryOptions({
        queryKey: transactionKeys.byUser(userId),
        queryFn: () => getTransactions(userId),
    })
}

export function useTransactionQuery(
    userId: string,
    initialData?: Transaction[]
) {
    return useQuery({ ...transactionsQuery(userId), initialData })
}

export const transactionsLoader = requireUser((userId) =>
    queryClient.ensureQueryData(transactionsQuery(userId))
)
