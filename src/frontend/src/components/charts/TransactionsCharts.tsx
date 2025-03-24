import React from "react"
import { Transaction } from "../../api/transaction/types"
import { Stack } from "@mui/material"
import TransactionsPieChart from "./TransactionsPieChart"

type TransactionsChartsProps = {
    transactions: Transaction[]
}

export type TransactionData = {
    name: string
    value: number
}

function getTransactionsData<T extends keyof Transaction>(
    transactions: Transaction[],
    property: T
) {
    const map = new Map<Transaction[T], number>()
    for (const transaction of transactions) {
        const key = transaction[property]
        const value = map.get(key) ?? 0
        map.set(key, value + 1)
    }
    return Array.from(map, ([name, value]) => ({ name, value }))
}

export default function TransactionsCharts({
    transactions,
}: TransactionsChartsProps) {
    const statusData = getTransactionsData(transactions, "status")
    const actionTypeData = getTransactionsData(transactions, "actionType")

    return (
        <Stack height="300px" width="100%" direction={"row"}>
            <TransactionsPieChart transactionData={statusData} />
            <TransactionsPieChart transactionData={actionTypeData} />
        </Stack>
    )
}
