import { useQuery } from "@tanstack/react-query"
import { Transaction } from "../../../api/transaction/types"
import { useQueryContext } from "../QueryContext"
import { transactionQuery } from "./queries"

export function useTransactionQuery(
    userId: string,
    initialData?: Transaction[]
) {
    const { getTransactions } = useQueryContext()
    return useQuery({
        ...transactionQuery(userId, getTransactions(userId)),
        initialData,
    })
}
