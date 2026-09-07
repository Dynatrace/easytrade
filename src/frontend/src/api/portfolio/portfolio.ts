import { backends } from "../backend"

export type PortfolioPoint = {
    timestamp: string
    totalValue: number
}

export async function getPortfolioHistory(accountId: string): Promise<PortfolioPoint[]> {
    console.log(`[getPortfolioHistory] accountId=${accountId}`)
    try {
        const data = await backends.portfolio.getHistory(accountId)
        return data.results
    } catch (error) {
        console.error("error: ", error)
        return []
    }
}
