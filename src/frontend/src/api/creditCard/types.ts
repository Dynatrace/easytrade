export type OrderStatus =
    | "order_created"
    | "card_ordered"
    | "card_created"
    | "card_shipped"
    | "card_delivered"
    | "card_error"
    | "sequence_error"

export type CreditCardLevel = "silver" | "gold" | "platinum"

export type DepositRequest = {
    accountId: string
    amount: number
    name: string
    address: string
    email: string
    cardNumber: string
    cardType: string
    cvv: string
}

export type WithdrawRequest = Omit<DepositRequest, "cvv">

export type DepositResponse = { error?: string }
export type WithdrawResponse = { error?: string }
export type DepositHandler = (r: DepositRequest) => Promise<DepositResponse>
export type WithdrawHandler = (r: WithdrawRequest) => Promise<WithdrawResponse>

export type CreditCardOrderRequest = {
    accountId: string
    name: string
    email: string
    shippingAddress: string
    cardLevel: CreditCardLevel
}

export type OrderStatusEntry = {
    status: OrderStatus
    orderId: string
    timestamp: string
    details: string
}

export type ErrorResponse = { type: "error"; error: string }
export type MissingOrderStatusResponse = { type: "not_found" }

export type CreditCardOrderResponse =
    | { type: "success"; creditCardOrderId: string }
    | ErrorResponse

export type SuccessOrderStatusResponse = { type: "success" } & OrderStatusEntry

export type OrderStatusResponse =
    | SuccessOrderStatusResponse
    | ErrorResponse
    | MissingOrderStatusResponse

export type SuccessOrderStatusHistoryResponse = {
    type: "success"
    orderId: string
    statusList: OrderStatusEntry[]
}

export type OrderStatusHistoryResponse =
    | SuccessOrderStatusHistoryResponse
    | ErrorResponse

export type RevokeCardResponse = { type: "success" } | ErrorResponse
