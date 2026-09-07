import React from "react"
import "@testing-library/jest-dom"
import { screen, render } from "@testing-library/react"
import { FormatterWrapper } from "../providers"
import { Transaction } from "../../api/transaction/types"
import { Instrument } from "../../api/instrument/types"
import TransactionsTable from "../../components/TransactionsTable"
const mockTransactions: Transaction[] = [
    {
        id: 1,
        actionType: "SELL",
        instrumentId: "550e8400-e29b-41d4-a716-446655440001",
        amount: 8460,
        price: 23.17,
        status: "FAIL",
        endTime: "2023-03-20T12:15:00",
    },
    {
        id: 2,
        actionType: "BUY",
        instrumentId: "550e8400-e29b-41d4-a716-446655440002",
        amount: 7,
        price: 3713.6,
        status: "FAIL",
        endTime: "2023-03-22T15:03:00",
    },
    {
        id: 3,
        actionType: "BUY",
        instrumentId: "550e8400-e29b-41d4-a716-446655440003",
        amount: 234,
        price: 373.6,
        status: "FAIL",
        endTime: "2023-03-21T08:04:00",
    },
    {
        id: 4,
        actionType: "SELL",
        instrumentId: "550e8400-e29b-41d4-a716-446655440004",
        amount: 56,
        price: 1000.23,
        status: "FAIL",
        endTime: "2023-03-22T03:03:00",
    },
    {
        id: 5,
        actionType: "BUY",
        instrumentId: "550e8400-e29b-41d4-a716-446655440002",
        amount: 10,
        price: 3713.6,
        status: "FAIL",
        endTime: "2023-03-21T20:03:00",
    },
]

describe("Transactions table", () => {
    test("displays full transaction data", () => {
        render(
            <FormatterWrapper>
                <TransactionsTable
                    transactions={[mockTransactions[0]]}
                    instruments={[]}
                   
                />
            </FormatterWrapper>
        )

        expect(
            screen.getByRole("cell", { name: /sell/i })
        ).toBeInTheDocument()
        expect(
            screen.getByRole("cell", { name: "550e8400-e29b-41d4-a716-446655440001" })
        ).toBeInTheDocument()
        expect(
            screen.getByRole("cell", { name: /8,460/ })
        ).toBeInTheDocument()
        expect(
            screen.getByRole("cell", { name: /23.17/ })
        ).toBeInTheDocument()
        expect(
            screen.getByRole("cell", { name: /fail/i })
        ).toBeInTheDocument()
        expect(
            screen.getByRole("cell", {
                name: /3\/20\/23, 12:15 pm/i,
            })
        ).toBeInTheDocument()
    })
    test("displays all rows", () => {
        render(
            <FormatterWrapper>
                <TransactionsTable
                    transactions={mockTransactions}
                    instruments={[]}

                />
            </FormatterWrapper>
        )
        expect(screen.getAllByRole("row", { name: /fail/i })).toHaveLength(5)
    })
    test("resolves instrument names from instruments array", () => {
        const mockInstruments: Instrument[] = [
            { id: "550e8400-e29b-41d4-a716-446655440001", name: "EasyHotels", code: "EHOTEL", description: "EasyHotels International", productId: 1, productName: "Share", amount: 100, price: { timestamp: "2023-03-20T12:15:00Z", open: 20, close: 23.17, low: 19, high: 25 } },
            { id: "550e8400-e29b-41d4-a716-446655440002", name: "Charles - Mathieu", code: "CHARM", description: "Charm Ltd", productId: 2, productName: "Share", amount: 50, price: { timestamp: "2023-03-20T12:15:00Z", open: 3700, close: 3713.6, low: 3600, high: 3800 } },
        ]
        render(
            <FormatterWrapper>
                <TransactionsTable
                    transactions={[mockTransactions[0], mockTransactions[1]]}
                    instruments={mockInstruments}
                />
            </FormatterWrapper>
        )
        expect(
            screen.getByRole("cell", { name: /easyhotels/i })
        ).toBeInTheDocument()
        expect(
            screen.getByRole("cell", { name: /charles - mathieu/i })
        ).toBeInTheDocument()
    })
})
