export type Instrument = {
    id: string
    code: string
    name: string
    description: string
    productId: number
    productName: string
    price: InstrumentPrice
    amount: number
}

export type InstrumentPrice = {
    timestamp: string
    open: number
    close: number
    low: number
    high: number
}
