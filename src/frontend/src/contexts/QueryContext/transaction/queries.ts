import { QueryFunction } from "@tanstack/react-query"
import { Transaction } from "../../../api/transaction/types"
import { QueryParams } from "../types"

export const transactionKeys = {
    all: ["transactions"] as const,
}

export function transactionQuery(
    userId: string,
    queryFn: QueryFunction<Transaction[]>
): QueryParams<Transaction[]> {
    return {
        queryKey: transactionKeys.all,
        queryFn,
    }
}
