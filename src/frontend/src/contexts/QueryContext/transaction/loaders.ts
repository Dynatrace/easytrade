import { QueryClient } from "@tanstack/react-query"
import { Transaction } from "../../../api/transaction/types"
import { transform } from "../QueryContext"
import { transactionQuery } from "./queries"

export function transactionsLoader(
    client: QueryClient,
    transactionsProvider: (userId: string) => Promise<Transaction[]>
) {
    const queryFn = transform(transactionsProvider)

    return async (userId: string) => {
        return await client.ensureQueryData(
            transactionQuery(userId, queryFn(userId))
        )
    }
}
