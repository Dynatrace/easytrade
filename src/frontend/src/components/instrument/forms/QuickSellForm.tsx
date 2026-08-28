import { useToast } from "../../../contexts/ToastContext/context"
import React, { useState } from "react"
import { useInstrument } from "../../../contexts/InstrumentContext/context"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { quickTransactionInvalidateQuery } from "../../../contexts/QueryContext/user/queries"



export default function QuickSellForm() {
    const { instrument, quickSellHandler } = useInstrument()
    const [amount, setAmount] = useState(0)
    const { showToast } = useToast()

    const price = instrument.price.close
    // NOTE: id="posessedAmount" — intentional typo kept to match loadgen selector
    const posessedAmount = instrument.amount
    const total = amount * price

    const queryClient = useQueryClient()
    const { mutate, isPending } = useMutation({
        mutationFn: async (): Promise<void> => {
            if (amount <= 0) throw "Amount must be greater than 0"
            if (amount > posessedAmount) throw "Can't sell more assets than possessed"
            const { error } = await quickSellHandler(amount)
            if (error !== undefined) throw error
        },
        onSuccess: async () => {
            showToast("Transaction successful", "success")
            setAmount(0)
            await quickTransactionInvalidateQuery(queryClient)
        },
        onError: (e: unknown) => showToast(typeof e === "string" ? e : ((e instanceof Error) ? e.message : String(e)), "error"),
    })

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault()
        mutate()
    }

    return (
        <form className="form" onSubmit={handleSubmit} style={{ minWidth: 280 }}>
            <div className="form-group">
                <label className="form-label" htmlFor="amount">Amount</label>
                <input
                    id="amount"
                    type="number"
                    min={0}
                    step={1}
                    value={amount || ""}
                    autoFocus
                    onChange={(e) => { setAmount(Number(e.target.value)) }}
                />
            </div>
            <div className="form-group">
                <label className="form-label" htmlFor="price">Instrument price</label>
                <input id="price" type="number" value={price} readOnly />
            </div>
            <div className="form-group">
                {/* id="posessedAmount" — loadgen selector relies on this exact (misspelled) id */}
                <label className="form-label" htmlFor="posessedAmount">Possessed amount</label>
                <input id="posessedAmount" type="number" value={posessedAmount} readOnly />
            </div>
            <div className="form-group">
                <label className="form-label">Total price</label>
                <input type="number" value={total} readOnly />
            </div>
            <div className="form-actions">
                <button id="submitButton" type="submit" className="btn btn-primary" disabled={isPending}>
                    {isPending ? <span className="spinner" /> : null}
                    Sell
                </button>
            </div>
        </form>
    )
}
