import { backends } from "../backend"

export type PortfolioPoint = {
    timestamp: string
    totalValue: number
}

export async function getPortfolioHistory(
    accountId: string,
    period: string
): Promise<PortfolioPoint[]> {
    console.log(`[getPortfolioHistory] accountId=${accountId} period=${period}`)
    try {
        const data = await backends.portfolio.getHistory(accountId, period)
        return data.results
    } catch (error) {
        console.error("error: ", error)
        return []
    }
}
