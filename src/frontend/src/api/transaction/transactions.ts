import axios from "axios"
import { Transaction } from "./types"
import { backends } from "../backend"
import { Transaction as RawTransaction } from "../backend/transactions"
import { DateTime } from "luxon"

export async function getTransactions(
    userId: string,
    records: number = 100
): Promise<Transaction[]> {
    console.log(`[getTransactions] API call with userId [${userId}]`)

    try {
        const { data } = await backends.transactions.getAll(userId, records)
        console.log("transaction data: ", data)
        return data.results.map(mapRawTransaction)
    } catch (error) {
        if (axios.isAxiosError(error)) {
            console.log("Axios error message: ", error.message)
        } else {
            console.log("Unexpected error: ", error)
        }
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
        instrumentName: instrumentId.toString(), // this will be change to name in TransactionsTable.tsx
        amount: quantity,
        price: entryPrice,
        status: mapStatus(status),
        endTime:
            DateTime.fromISO(timestampClose, { zone: "utc" }).toISO() ??
            timestampClose,
    }
}

function mapStatus(status: string): string {
    if (status.toLowerCase().indexOf("finished") > 0) {
        return "SUCCESS"
    } else if (status.toLowerCase().indexOf("failed") > 0) {
        return "FAIL"
    } else {
        return "ACTIVE"
    }
}

function mapDirection(direction: string): string {
    if (direction.toLowerCase().indexOf("buy") > 0) {
        return "BUY"
    } else {
        return "SELL"
    }
}
