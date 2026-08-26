import React, { useState } from "react"
import { useInstrument } from "../../../contexts/InstrumentContext/context"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { quickTransactionInvalidateQuery } from "../../../contexts/QueryContext/user/queries"
import useStatusDisplay from "../../../hooks/useStatusDisplay"
import StatusDisplay from "../../StatusDisplay"
import { useAuthUserData } from "../../../contexts/UserContext/hooks"
import { useFormatter } from "../../../contexts/FormatterContext/context"

export default function QuickBuyForm() {
    const { balance } = useAuthUserData()
    const { formatCurrency } = useFormatter()
    const { instrument, quickBuyHandler } = useInstrument()
    const [amount, setAmount] = useState(0)
    const { setError, setSuccess, resetStatus, statusContext } = useStatusDisplay()

    const price = instrument.price.close
    const currentBalance = balance?.value ?? 0
    const total = amount * price

    const queryClient = useQueryClient()
    const { mutate, isPending } = useMutation({
        mutationFn: async (): Promise<void> => {
            if (amount <= 0) throw "Amount must be greater than 0"
            if (total > currentBalance) throw "Total price can't exceed current balance"
            const { error } = await quickBuyHandler(amount)
            if (error !== undefined) throw error
        },
        onMutate: resetStatus,
        onSuccess: async () => {
            setSuccess("Transaction successful")
            setAmount(0)
            await quickTransactionInvalidateQuery(queryClient)
        },
        onError: (e: unknown) => setError(typeof e === "string" ? e : ((e instanceof Error) ? e.message : String(e))),
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
                    value={amount}
                    autoFocus
                    onChange={(e) => { setAmount(Number(e.target.value)); resetStatus() }}
                />
            </div>
            <div className="form-group">
                <label className="form-label" htmlFor="price">Instrument price</label>
                <input id="price" type="number" value={price} readOnly />
            </div>
            <div className="form-group">
                <label className="form-label" htmlFor="currentBalance">Current balance</label>
                <input id="currentBalance" type="text" value={formatCurrency(currentBalance)} readOnly />
            </div>
            <div className="form-group">
                <label className="form-label">Total price</label>
                <input type="number" value={total} readOnly />
            </div>
            <div className="form-actions">
                <button id="submitButton" type="submit" className="btn btn-primary" disabled={isPending}>
                    {isPending ? <span className="spinner" /> : null}
                    Buy
                </button>
            </div>
            <StatusDisplay {...statusContext} />
        </form>
    )
}
