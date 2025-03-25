import axios, { AxiosInstance } from "axios"
import { XMLParser } from "fast-xml-parser"

export type DepositRequest = {
    accountId: number
    amount: number
    name: string
    address: string
    email: string
    cardNumber: string
    cardType: string
    cvv: string
}

export type WithdrawRequest = {
    accountId: number
    amount: number
    name: string
    address: string
    email: string
    cardNumber: string
    cardType: string
}

export type OrderStatus =
    | "order_created"
    | "card_ordered"
    | "card_created"
    | "card_shipped"
    | "card_delivered"
    | "card_error"
    | "sequence_error"

export type CreditCardLevel = "silver" | "gold" | "platinum"

export type CreditCardOrderRequest = {
    accountId: number
    name: string
    email: string
    shippingAddress: string
    cardLevel: CreditCardLevel
}

export type CreditCardOrderResponse = {
    statusCode: number
    message: string
    results?: {
        creditCardOrderId: string
    }
}

export type CardStatusResult = {
    id: number
    creditCardOrderId: string
    timestamp: string
    status: OrderStatus
    details: string
}

export type CardStatusHistory = {
    creditCardOrderId: string
    statusList: CardStatusResult[]
}

export type CreditCardResponse<T extends CardStatusResult | CardStatusHistory> =
    {
        statusCode: number
        message: string
        results?: T
    }

export type CreditCardResponseXml<
    T extends CardStatusResult | CardStatusHistory,
> = {
    StandardResponse: CreditCardResponse<T>
}

export class CreditCardBackend {
    private readonly brokerAgent: AxiosInstance
    private readonly creditCardAgent: AxiosInstance

    constructor(brokerUrl: string, creditCardServiceUrl: string) {
        this.brokerAgent = axios.create({
            baseURL: brokerUrl,
            headers: {
                Accept: "application/json",
                "Content-Type": "application/json",
            },
        })
        this.creditCardAgent = axios.create({
            baseURL: creditCardServiceUrl,
            headers: {
                Accept: "application/json",
                "Content-Type": "application/json",
            },
        })
    }

    deposit(request: DepositRequest) {
        return this.brokerAgent.post<DepositRequest>(
            `/balance/${request.accountId}/deposit`,
            request
        )
    }

    withdraw(request: WithdrawRequest) {
        return this.brokerAgent.post<WithdrawRequest>(
            `/balance/${request.accountId}/withdraw`,
            request
        )
    }

    orderCard(request: CreditCardOrderRequest) {
        return this.creditCardAgent.post<CreditCardOrderResponse>(
            "orders",
            request
        )
    }

    async getOrderStatusXml(xmlParser: XMLParser, accountId: number) {
        const response = await this.creditCardAgent.get(
            `/orders/${accountId}/status/latest`,
            {
                validateStatus: (status) => status < 400 || status === 404,
                headers: {
                    "Content-Type": "application/xml",
                    Accept: "application/xml",
                },
            }
        )
        return xmlParser.parse(
            response.data
        ) as CreditCardResponseXml<CardStatusResult>
    }

    getOrderStatusHistory(accountId: number) {
        return this.creditCardAgent.get<CreditCardResponse<CardStatusHistory>>(
            `orders/${accountId}/status`
        )
    }

    deleteCardAndOrder(accountId: number) {
        return this.creditCardAgent.delete<CreditCardResponse<never>>(
            `orders/${accountId}`
        )
    }
}
