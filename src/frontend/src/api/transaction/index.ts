import { getJson, post, services } from "../http"
import { BizEvents } from "../bizEvents"
import { BuyHandler, HandlerResponse, SellHandler, Transaction } from "./types"
export * from "./types"

type TransactionDto = {
    instrumentId: string
    direction: string
    quantity: number
    entryPrice: number
    timestampOpen: string
    timestampClose: string | null
    tradeClosed: boolean
    transactionHappened: boolean
    status: string
}

type TransactionsDto = { results: TransactionDto[] }

const TRANSACTION_ERROR = "There was an error when creating transaction."

export async function getTransactions(
    userId: string,
    records: number = 100
): Promise<Transaction[]> {
    const { results } = await getJson<TransactionsDto>(
        `${services.broker()}/trade/${userId}?count=${records}`
    )
    return results.map(mapTransaction)
}

function mapTransaction(
    {
        direction,
        instrumentId,
        quantity,
        entryPrice,
        status,
        timestampOpen,
        timestampClose,
    }: TransactionDto,
    index: number
): Transaction {
    return {
        // The broker's TradeDTO deliberately omits the entity's Guid, so there
        // is no stable per-trade id to use. The identifying fields alone are
        // not unique either — timestampClose is null for every still-open long
        // trade — so the index is appended to guarantee uniqueness for use as
        // a React key.
        id: `${timestampOpen}-${timestampClose ?? "open"}-${instrumentId}-${direction}-${index}`,
        actionType: mapDirection(direction),
        instrumentId: instrumentId.toString(),
        amount: quantity,
        price: entryPrice,
        status: mapStatus(status),
        endTime: parseUtcIso(timestampClose),
    }
}

function parseUtcIso(value: string | null): string {
    if (value === null) return ""
    const d = new Date(value)
    return isNaN(d.getTime()) ? value : d.toISOString()
}

function mapStatus(status: string): string {
    const s = status.toLowerCase()
    if (s.includes("finished") || s.includes("done")) return "SUCCESS"
    if (s.includes("failed")) return "FAIL"
    return "ACTIVE"
}

function mapDirection(direction: string): string {
    return direction.toLowerCase().includes("buy") ? "BUY" : "SELL"
}

export async function quickBuy(
    userId: string,
    instrumentId: string,
    amount: number
): Promise<HandlerResponse> {
    const body = { accountId: userId, instrumentId, amount }
    try {
        BizEvents.buyStart(body)
        await post(`${services.broker()}/trade/buy`, body)
        BizEvents.buyFinish()
        return {}
    } catch (error) {
        console.error("[quickBuy] failed", error)
        BizEvents.buyError(TRANSACTION_ERROR)
        return { error: TRANSACTION_ERROR }
    }
}

export async function quickSell(
    userId: string,
    instrumentId: string,
    amount: number
): Promise<HandlerResponse> {
    const body = { accountId: userId, instrumentId, amount }
    try {
        BizEvents.sellStart(body)
        await post(`${services.broker()}/trade/sell`, body)
        BizEvents.sellFinish()
        return {}
    } catch (error) {
        console.error("[quickSell] failed", error)
        BizEvents.sellError(TRANSACTION_ERROR)
        return { error: TRANSACTION_ERROR }
    }
}

async function longTrade(
    path: "buy" | "sell",
    userId: string,
    instrumentId: string,
    amount: number,
    price: number,
    time: number
): Promise<HandlerResponse> {
    try {
        await post(`${services.broker()}/trade/long/${path}`, {
            accountId: userId,
            instrumentId,
            amount,
            price,
            duration: time,
        })
        return {}
    } catch (error) {
        console.error(`[${path}] failed`, error)
        return { error: TRANSACTION_ERROR }
    }
}

export const buy: BuyHandler = (userId, instrumentId, amount, price, time) =>
    longTrade("buy", userId, instrumentId, amount, price, time)

export const sell: SellHandler = (userId, instrumentId, amount, price, time) =>
    longTrade("sell", userId, instrumentId, amount, price, time)
