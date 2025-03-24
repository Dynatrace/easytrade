import { XMLParser } from "fast-xml-parser"
import { backends } from "../../backend"
import {
    CardStatusResult,
    CreditCardOrderRequest,
    CreditCardResponse,
    OrderStatus,
} from "../../backend/creditCard"

type SuccessCreditCardOrderResponse = {
    type: "success"
    creditCardOrderId: string
}
type ErrorCreditCardOrderResponse = { type: "error"; error: string }
export type CreditCardOrderResponse =
    | SuccessCreditCardOrderResponse
    | ErrorCreditCardOrderResponse

export type MissingOrderStatusResponse = { type: "not_found" }
export type OrderStatusEntry = {
    status: OrderStatus
    orderId: string
    timestamp: string
    details: string
}
export type SuccessOrderStatusResponse = {
    type: "success"
} & OrderStatusEntry

export type ErrorResponse = { type: "error"; error: string }
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

export async function orderCreditCard(
    userId: string,
    data: Omit<CreditCardOrderRequest, "accountId">
): Promise<CreditCardOrderResponse> {
    const request: CreditCardOrderRequest = {
        accountId: Number(userId),
        ...data,
    }
    console.log(
        `calling [credit-card-order] API with data [${JSON.stringify(request)}]`
    )
    try {
        const { data: response } = await backends.creditCards.orderCard(request)
        if (response.results === undefined) {
            throw new Error("Results not included in the response")
        }
        return {
            type: "success",
            creditCardOrderId: response.results.creditCardOrderId,
        }
    } catch (error) {
        console.error(
            `error when ordering credit card for user [${userId}]`,
            error
        )
        return {
            type: "error",
            error: "There was an error ordering credit card.",
        }
    }
}

export async function getOrderStatus(
    userId: string
): Promise<OrderStatusResponse> {
    console.log(`calling [credit-card-order-status] API for user [${userId}]`)
    try {
        const data = await backends.creditCards.getOrderStatusXml(
            new XMLParser(),
            Number(userId)
        )
        console.log(`order status for user [${userId}]`, data)
        return orderStatusMapper(data.StandardResponse)
    } catch (error) {
        console.error(
            `error when getting order status for user [${userId}]`,
            error
        )
        return {
            type: "error",
            error: "There was an error when getting order status.",
        }
    }
}

export async function getOrderStatusHistory(
    userId: string
): Promise<OrderStatusHistoryResponse> {
    console.log(
        `calling [credit-card-order-status-history] API for user ${userId}`
    )
    try {
        const { data } = await backends.creditCards.getOrderStatusHistory(
            Number(userId)
        )
        console.log(`order status history for user [${userId}]`, data)
        const { results } = data
        if (results === undefined) {
            throw new Error("Field [results] not found in response.")
        }
        return {
            type: "success",
            orderId: results.creditCardOrderId,
            statusList: results.statusList.map(
                // eslint-disable-next-line @typescript-eslint/no-unused-vars
                ({ creditCardOrderId, id, ...rest }) => ({
                    orderId: creditCardOrderId,
                    ...rest,
                })
            ),
        }
    } catch (error) {
        console.error(
            `error when getting order status history for user [${userId}]`,
            error
        )
        return {
            type: "error",
            error: "There was an error when getting order status history.",
        }
    }
}

function orderStatusMapper({
    statusCode,
    results,
}: CreditCardResponse<CardStatusResult>):
    | SuccessOrderStatusResponse
    | MissingOrderStatusResponse {
    if (statusCode === 404) {
        return { type: "not_found" }
    }
    if (results === undefined) {
        throw Error("Field [results] not found in response.")
    }
    return {
        type: "success",
        orderId: results.creditCardOrderId,
        timestamp: results.timestamp,
        status: results.status,
        details: results.details,
    }
}

export async function revokeCreditCard(
    userId: string
): Promise<RevokeCardResponse> {
    console.log(`calling [delete-credit-card] API for account [${userId}]`)
    try {
        await backends.creditCards.deleteCardAndOrder(Number(userId))
        return { type: "success" }
    } catch (error) {
        console.error(
            `error when deleting credit card for account [${userId}]`,
            error
        )
        return {
            type: "error",
            error: "There was an error when trying to revoke the card.",
        }
    }
}
