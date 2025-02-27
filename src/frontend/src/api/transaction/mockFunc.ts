import { delay } from "../util"
import { HandlerResponse } from "./types"

export async function quickBuyMock(
    userId: string,
    instrumentId: string,
    amount: number,
    price: number
): Promise<HandlerResponse> {
    console.log(
        `mock [quickBuyHandler] API called with [${JSON.stringify({
            userId,
            instrumentId,
            amount,
            price,
        })}]`
    )
    await delay(2000)
    return {
        error: 'There once was a ship that put to sea, the name of the ship was "Ahh yerr got an error!"',
    }
}

export async function quickSellMock(
    userId: string,
    instrumentId: string,
    amount: number,
    price: number
): Promise<HandlerResponse> {
    console.log(
        `mock [quickSellHandler] API called with [${JSON.stringify({
            userId,
            instrumentId,
            amount,
            price,
        })}]`
    )
    await delay(2000)
    return {}
}

export async function buyMock(
    userId: string,
    instrumentId: string,
    amount: number,
    price: number,
    time: number
): Promise<HandlerResponse> {
    console.log(
        `mock [buyHandler] API called with [${JSON.stringify({
            userId,
            instrumentId,
            amount,
            price,
            time,
        })}]`
    )
    await delay(2000)
    return {}
}

export async function sellMock(
    userId: string,
    instrumentId: string,
    amount: number,
    price: number,
    time: number
): Promise<HandlerResponse> {
    console.log(
        `mock [sellHandler] API called with [${JSON.stringify({
            userId,
            instrumentId,
            amount,
            price,
            time,
        })}]`
    )
    await delay(2000)
    return {}
}
