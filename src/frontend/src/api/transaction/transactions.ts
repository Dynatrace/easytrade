import { Transaction } from "./types"
import { backends } from "../backend"
import { Transaction as RawTransaction } from "../backend/transactions"

export async function getTransactions(
    userId: string,
    records: number = 100
): Promise<Transaction[]> {
    try {
        const data = await backends.transactions.getAll(userId, records)
        return data.results.map(mapRawTransaction)
    } catch {
        return []
    }
}

function mapRawTransaction(
    {
        direction,
        instrumentId,
        quantity,
        entryPrice,
        status,
        timestampClose,
    }: RawTransaction,
    index: number
): Transaction {
    return {
        id: index,
        actionType: mapDirection(direction),
        instrumentName: instrumentId.toString(),
        amount: quantity,
        price: entryPrice,
        status: mapStatus(status),
        endTime: parseUtcIso(timestampClose),
    }
}

function parseUtcIso(value: string): string {
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
