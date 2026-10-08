import { queryOptions, useQuery } from "@tanstack/react-query"
import { getPortfolioHistory } from "../api/portfolio"
import { portfolioKeys } from "../utils/queryKeys"

export function portfolioHistoryQuery(accountId: string) {
    return queryOptions({
        queryKey: portfolioKeys.history(accountId),
        queryFn: () => getPortfolioHistory(accountId),
    })
}

export function usePortfolioHistoryQuery(accountId: string) {
    return useQuery(portfolioHistoryQuery(accountId))
}
