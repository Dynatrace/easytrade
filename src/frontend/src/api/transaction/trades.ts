import axios from "axios"
import { HandlerResponse } from "./types"
import { backends } from "../backend"
import { BizEvents } from "../bizEvents"

export async function quickBuy(
    userId: string,
    instrumentId: string,
    amount: number
): Promise<HandlerResponse> {
    console.log(
        `[quickBuyHandler] API called with [${JSON.stringify({
            userId,
            instrumentId,
            amount,
        })}]`
    )

    try {
        const body = {
            accountId: Number(userId),
            instrumentId: Number(instrumentId),
            amount,
        }
        BizEvents.buyStart(body)
        await backends.transactions.quickBuy(body)
        BizEvents.buyFinish()
        return {}
    } catch (error) {
        if (axios.isAxiosError(error)) {
            console.error("Axios error message: ", error.message)
        } else {
            console.error("Unexpected error: ", error)
        }
        const msg = "There was an error when creating transaction."
        BizEvents.buyError(msg)
        return { error: msg }
    }
}

export async function quickSell(
    userId: string,
    instrumentId: string,
    amount: number
): Promise<HandlerResponse> {
    console.log(
        `[quickSellHandler] API called with [${JSON.stringify({
            userId,
            instrumentId,
            amount,
        })}]`
    )

    try {
        const body = {
            accountId: Number(userId),
            instrumentId: Number(instrumentId),
            amount,
        }
        BizEvents.sellStart(body)
        await backends.transactions.quickSell(body)
        BizEvents.sellFinish()
        return {}
    } catch (error) {
        if (axios.isAxiosError(error)) {
            console.error("Axios error message: ", error.message)
        } else {
            console.error("Unexpected error: ", error)
        }
        const msg = "There was an error when creating transaction."
        BizEvents.sellError(msg)
        return { error: msg }
    }
}

export async function buy(
    userId: string,
    instrumentId: string,
    amount: number,
    price: number,
    time: number
): Promise<HandlerResponse> {
    console.log(
        `[buyHandler] API called with [${JSON.stringify({
            userId,
            instrumentId,
            amount,
            price,
            time,
        })}]`
    )

    try {
        await backends.transactions.buy({
            accountId: Number(userId),
            instrumentId: Number(instrumentId),
            amount,
            price,
            duration: time,
        })
        return {}
    } catch (error) {
        if (axios.isAxiosError(error)) {
            console.error("Axios error message: ", error.message)
        } else {
            console.error("Unexpected error: ", error)
        }
        return { error: "There was an error when creating transaction." }
    }
}

export async function sell(
    userId: string,
    instrumentId: string,
    amount: number,
    price: number,
    time: number
): Promise<HandlerResponse> {
    console.log(
        `[sellHandler] API called with [${JSON.stringify({
            userId,
            instrumentId,
            amount,
            price,
            time,
        })}]`
    )

    try {
        await backends.transactions.sell({
            accountId: Number(userId),
            instrumentId: Number(instrumentId),
            amount,
            price,
            duration: time,
        })
        return {}
    } catch (error) {
        if (axios.isAxiosError(error)) {
            console.error("Axios error message: ", error.message)
        } else {
            console.error("Unexpected error: ", error)
        }
        return { error: "There was an error when creating transaction." }
    }
}
