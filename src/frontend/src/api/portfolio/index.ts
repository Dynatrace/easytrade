import { getJson, services } from "../http"
import { PortfolioPoint } from "./types"
export * from "./types"

type PortfolioHistoryDto = {
    results: PortfolioPoint[]
}

export async function getPortfolioHistory(
    accountId: string
): Promise<PortfolioPoint[]> {
    const { results } = await getJson<PortfolioHistoryDto>(
        `${services.broker()}/portfolio/history/${accountId}`
    )
    return results
}
