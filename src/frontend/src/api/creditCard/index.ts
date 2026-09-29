import { XMLParser } from "fast-xml-parser"
import { del, getJson, getXml, post, postJson, services } from "../http"
import { BizEvents } from "../bizEvents"
import {
    CreditCardOrderRequest,
    CreditCardOrderResponse,
    DepositRequest,
    DepositResponse,
    OrderStatus,
    OrderStatusHistoryResponse,
    OrderStatusResponse,
    RevokeCardResponse,
    WithdrawRequest,
    WithdrawResponse,
} from "./types"
export * from "./types"

type CardStatusDto = {
    id: string
    creditCardOrderId: string
    timestamp: string
    status: OrderStatus
    details: string
}

type CardStatusHistoryDto = {
    creditCardOrderId: string
    statusList: CardStatusDto[]
}

type StandardResponseDto<T> = {
    statusCode: number
    message: string
    results?: T
}

type OrderStatusXmlDto = {
    StandardResponse: StandardResponseDto<CardStatusDto>
}

type OrderDto = { results?: { creditCardOrderId: string } }

export async function deposit(
    request: DepositRequest
): Promise<DepositResponse> {
    try {
        BizEvents.depositStart(request)
        await post(
            `${services.broker()}/balance/${request.accountId}/deposit`,
            request
        )
        BizEvents.depositFinish()
        return {}
    } catch (error) {
        console.error("[deposit] failed", error)
        const msg = "There was an error processing the deposit"
        BizEvents.depositError(msg)
        return { error: msg }
    }
}

export async function withdraw(
    request: WithdrawRequest
): Promise<WithdrawResponse> {
    try {
        BizEvents.withdrawStart(request)
        await post(
            `${services.broker()}/balance/${request.accountId}/withdraw`,
            request
        )
        BizEvents.withdrawFinish()
        return {}
    } catch (error) {
        console.error("[withdraw] failed", error)
        const msg = "There was an error processing the withdraw"
        BizEvents.withdrawError(msg)
        return { error: msg }
    }
}

export async function orderCreditCard(
    userId: string,
    data: Omit<CreditCardOrderRequest, "accountId">
): Promise<CreditCardOrderResponse> {
    try {
        const response = await postJson<OrderDto>(
            `${services.creditCard()}/orders`,
            { accountId: userId, ...data }
        )
        if (response.results === undefined) {
            throw new Error("Results not included in the response")
        }
        return {
            type: "success",
            creditCardOrderId: response.results.creditCardOrderId,
        }
    } catch (error) {
        console.error(`[orderCreditCard] failed for user [${userId}]`, error)
        return {
            type: "error",
            error: "There was an error ordering credit card.",
        }
    }
}

/**
 * "No card ordered yet" is a normal state, not a failure, so a 404 maps to
 * `not_found` — `CreditCardLayout` routes the user to the order form on it.
 */
export async function getOrderStatus(
    userId: string
): Promise<OrderStatusResponse> {
    try {
        const body = await getXml(
            `${services.creditCard()}/orders/${userId}/status/latest`,
            [404]
        )
        const { StandardResponse } = new XMLParser().parse(
            body
        ) as OrderStatusXmlDto

        if (StandardResponse.statusCode === 404) {
            return { type: "not_found" }
        }
        const results = StandardResponse.results
        if (results === undefined) {
            throw new Error("Field [results] not found in response.")
        }
        return {
            type: "success",
            orderId: results.creditCardOrderId,
            timestamp: results.timestamp,
            status: results.status,
            details: results.details,
        }
    } catch (error) {
        console.error(`[getOrderStatus] failed for user [${userId}]`, error)
        return {
            type: "error",
            error: "There was an error when getting order status.",
        }
    }
}

export async function getOrderStatusHistory(
    userId: string
): Promise<OrderStatusHistoryResponse> {
    try {
        const { results } = await getJson<
            StandardResponseDto<CardStatusHistoryDto>
        >(`${services.creditCard()}/orders/${userId}/status`)

        if (results === undefined) {
            throw new Error("Field [results] not found in response.")
        }
        return {
            type: "success",
            orderId: results.creditCardOrderId,
            statusList: results.statusList.map(
                ({ creditCardOrderId, timestamp, status, details }) => ({
                    orderId: creditCardOrderId,
                    timestamp,
                    status,
                    details,
                })
            ),
        }
    } catch (error) {
        console.error(
            `[getOrderStatusHistory] failed for user [${userId}]`,
            error
        )
        return {
            type: "error",
            error: "There was an error when getting order status history.",
        }
    }
}

export async function revokeCreditCard(
    userId: string
): Promise<RevokeCardResponse> {
    try {
        await del(`${services.creditCard()}/orders/${userId}`)
        return { type: "success" }
    } catch (error) {
        console.error(`[revokeCreditCard] failed for user [${userId}]`, error)
        return {
            type: "error",
            error: "There was an error when trying to revoke the card.",
        }
    }
}
