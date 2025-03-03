export type Transaction = {
    id: number
    actionType: string
    instrumentName: string
    amount: number
    price: number
    status: string
    endTime: string
}

export type HandlerResponse = { error?: string }

export type QuickBuyHandler = (
    userId: string,
    instrumentId: string,
    amount: number
) => Promise<HandlerResponse>
export type QuickSellHandler = (
    userId: string,
    instrumentId: string,
    amount: number
) => Promise<HandlerResponse>
export type BuyHandler = (
    userId: string,
    instrumentId: string,
    amount: number,
    price: number,
    time: number
) => Promise<HandlerResponse>
export type SellHandler = (
    userId: string,
    instrumentId: string,
    amount: number,
    price: number,
    time: number
) => Promise<HandlerResponse>
