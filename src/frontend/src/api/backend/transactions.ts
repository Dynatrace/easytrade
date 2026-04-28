export type Transaction = {
    instrumentId: string
    direction: string
    quantity: number
    entryPrice: number
    timestampOpen: string
    timestampClose: string
    tradeClosed: boolean
    transactionHappened: boolean
    status: string
}

export type QuickTransactionRequest = {
    accountId: number
    instrumentId: number
    amount: number
}

type TransactionResult = {
    results: Transaction[]
}

type LongTransactionRequest = {
    accountId: number
    instrumentId: number
    amount: number
    price: number
    duration: number
}

export class TransactionBackend {
    private readonly baseUrl: string
    private readonly headers: Record<string, string>

    constructor(baseUrl: string) {
        this.baseUrl = baseUrl
        this.headers = {
            Accept: "application/json",
            "Content-Type": "application/json",
        }
    }

    async getAll(accountId: string, limit: number): Promise<TransactionResult> {
        const response = await fetch(
            `${this.baseUrl}/trade/${accountId}?count=${limit}&onlyLong=true`,
            { headers: this.headers }
        )
        if (!response.ok) throw new Error(`HTTP ${response.status}`)
        return response.json() as Promise<TransactionResult>
    }

    async quickBuy(request: QuickTransactionRequest): Promise<void> {
        const response = await fetch(`${this.baseUrl}/trade/buy`, {
            method: "POST",
            headers: this.headers,
            body: JSON.stringify(request),
        })
        if (!response.ok) throw new Error(`HTTP ${response.status}`)
    }

    async quickSell(request: QuickTransactionRequest): Promise<void> {
        const response = await fetch(`${this.baseUrl}/trade/sell`, {
            method: "POST",
            headers: this.headers,
            body: JSON.stringify(request),
        })
        if (!response.ok) throw new Error(`HTTP ${response.status}`)
    }

    async buy(request: LongTransactionRequest): Promise<void> {
        const response = await fetch(`${this.baseUrl}/trade/long/buy`, {
            method: "POST",
            headers: this.headers,
            body: JSON.stringify(request),
        })
        if (!response.ok) throw new Error(`HTTP ${response.status}`)
    }

    async sell(request: LongTransactionRequest): Promise<void> {
        const response = await fetch(`${this.baseUrl}/trade/long/sell`, {
            method: "POST",
            headers: this.headers,
            body: JSON.stringify(request),
        })
        if (!response.ok) throw new Error(`HTTP ${response.status}`)
    }
}
