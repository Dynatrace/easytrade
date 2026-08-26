export type PortfolioPoint = {
    timestamp: string
    totalValue: number
}

type PortfolioHistoryResponse = {
    results: PortfolioPoint[]
}

export class PortfolioBackend {
    private readonly baseUrl: string
    private readonly headers: Record<string, string>

    constructor(baseUrl: string) {
        this.baseUrl = baseUrl
        this.headers = { Accept: "application/json" }
    }

    async getHistory(accountId: string, period: string): Promise<PortfolioHistoryResponse> {
        const response = await fetch(
            `${this.baseUrl}/portfolio/history/${accountId}?period=${period}`,
            { headers: this.headers }
        )
        if (!response.ok) throw new Error(`HTTP ${response.status}`)
        return response.json() as Promise<PortfolioHistoryResponse>
    }
}
