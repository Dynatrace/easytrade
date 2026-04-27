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
    private readonly brokerUrl: string
    private readonly creditCardServiceUrl: string
    private readonly jsonHeaders: Record<string, string>

    constructor(brokerUrl: string, creditCardServiceUrl: string) {
        this.brokerUrl = brokerUrl
        this.creditCardServiceUrl = creditCardServiceUrl
        this.jsonHeaders = {
            Accept: "application/json",
            "Content-Type": "application/json",
        }
    }

    async deposit(request: DepositRequest): Promise<void> {
        const response = await fetch(
            `${this.brokerUrl}/balance/${request.accountId}/deposit`,
            {
                method: "POST",
                headers: this.jsonHeaders,
                body: JSON.stringify(request),
            }
        )
        if (!response.ok) throw new Error(`HTTP ${response.status}`)
    }

    async withdraw(request: WithdrawRequest): Promise<void> {
        const response = await fetch(
            `${this.brokerUrl}/balance/${request.accountId}/withdraw`,
            {
                method: "POST",
                headers: this.jsonHeaders,
                body: JSON.stringify(request),
            }
        )
        if (!response.ok) throw new Error(`HTTP ${response.status}`)
    }

    async orderCard(
        request: CreditCardOrderRequest
    ): Promise<CreditCardOrderResponse> {
        const response = await fetch(`${this.creditCardServiceUrl}/orders`, {
            method: "POST",
            headers: this.jsonHeaders,
            body: JSON.stringify(request),
        })
        if (!response.ok) throw new Error(`HTTP ${response.status}`)
        return response.json() as Promise<CreditCardOrderResponse>
    }

    async getOrderStatusXml(
        xmlParser: XMLParser,
        accountId: number
    ): Promise<CreditCardResponseXml<CardStatusResult>> {
        const response = await fetch(
            `${this.creditCardServiceUrl}/orders/${accountId}/status/latest`,
            {
                headers: {
                    "Content-Type": "application/xml",
                    Accept: "application/xml",
                },
            }
        )
        if (!response.ok && response.status !== 404)
            throw new Error(`HTTP ${response.status}`)
        return xmlParser.parse(
            await response.text()
        ) as CreditCardResponseXml<CardStatusResult>
    }

    async getOrderStatusHistory(
        accountId: number
    ): Promise<CreditCardResponse<CardStatusHistory>> {
        const response = await fetch(
            `${this.creditCardServiceUrl}/orders/${accountId}/status`,
            { headers: this.jsonHeaders }
        )
        if (!response.ok) throw new Error(`HTTP ${response.status}`)
        return response.json() as Promise<CreditCardResponse<CardStatusHistory>>
    }

    async deleteCardAndOrder(accountId: number): Promise<void> {
        const response = await fetch(
            `${this.creditCardServiceUrl}/orders/${accountId}`,
            { method: "DELETE", headers: this.jsonHeaders }
        )
        if (!response.ok) throw new Error(`HTTP ${response.status}`)
    }
}
