export type Transaction = {
    id: string
    actionType: string
    instrumentId: string
    amount: number
    price: number
    status: string
    endTime: string
}

export type HandlerResponse = { error?: string }

export type QuickTransactionRequest = {
    accountId: string
    instrumentId: string
    amount: number
}

export type QuickBuyHandler = (
    userId: string,
    instrumentId: string,
    amount: number
) => Promise<HandlerResponse>
export type QuickSellHandler = QuickBuyHandler
export type BuyHandler = (
    userId: string,
    instrumentId: string,
    amount: number,
    price: number,
    time: number
) => Promise<HandlerResponse>
export type SellHandler = BuyHandler
