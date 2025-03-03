import axios, { AxiosInstance } from "axios"

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
    private readonly agent: AxiosInstance

    constructor(baseUrl: string) {
        this.agent = axios.create({
            baseURL: baseUrl,
            headers: {
                Accept: "application/json",
                "Content-Type": "application/json",
            },
        })
    }

    getAll(accountId: string, limit: number) {
        return this.agent.get<TransactionResult>(
            `/trade/${accountId}?count=${limit}&onlyLong=true`
        )
    }

    quickBuy(request: QuickTransactionRequest) {
        return this.agent.post<string | null>("/trade/buy", request)
    }
    quickSell(request: QuickTransactionRequest) {
        return this.agent.post<string | null>("/trade/sell", request)
    }
    buy(request: LongTransactionRequest) {
        return this.agent.post<string | null>("/trade/long/buy", request)
    }
    sell(request: LongTransactionRequest) {
        return this.agent.post<string | null>("/trade/long/sell", request)
    }
}
