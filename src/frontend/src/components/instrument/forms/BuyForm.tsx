import { useToast } from "../../../contexts/ToastContext/context"
import React, { useState } from "react"
import { useInstrument } from "../../../contexts/InstrumentContext/context"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { transactionInvalidateQuery } from "../../../contexts/QueryContext/user/queries"


import { useAuthUserData } from "../../../contexts/UserContext/hooks"
import { AutofillButton } from "./AutofillButton"

export default function BuyForm() {
    const { balance } = useAuthUserData()
    const { instrument, buyHandler } = useInstrument()
    const [amount, setAmount] = useState(0)
    const [price, setPrice] = useState(instrument.price.close)
    const [time, setTime] = useState(1)
    const { showToast } = useToast()

    const total = amount * price

    const queryClient = useQueryClient()
    const { mutate, isPending } = useMutation({
        mutationFn: async (): Promise<void> => {
            if (amount <= 0) throw "Amount must be greater than 0"
            if (price <= 0) throw "Price must be greater than 0"
            if (time < 1 || time > 24) throw "Time must be between 1 and 24 hours"
            const { error } = await buyHandler(amount, price, time)
            if (error !== undefined) throw error
        },
        onSuccess: async () => {
            showToast("Transaction scheduled", "success")
            setAmount(0)
            setPrice(instrument.price.close)
            setTime(1)
            await transactionInvalidateQuery(queryClient)
        },
        onError: (e: unknown) => showToast(typeof e === "string" ? e : ((e instanceof Error) ? e.message : String(e)), "error"),
    })

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault()
        mutate()
    }

    const availableBalance = balance?.value ?? 0

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
                    onChange={(e) => { setAmount(Number(e.target.value)) }}
                />
            </div>
            <div className="form-group">
                <label className="form-label" htmlFor="price">Instrument price</label>
                <input
                    id="price"
                    type="number"
                    min={0}
                    step="any"
                    value={price}
                    onChange={(e) => { setPrice(Number(e.target.value)) }}
                />
            </div>
            <div className="form-group">
                <label className="form-label" htmlFor="time">Time [h]</label>
                <input
                    id="time"
                    type="number"
                    min={1}
                    max={24}
                    step={1}
                    value={time}
                    onChange={(e) => { setTime(Number(e.target.value)) }}
                />
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
                <AutofillButton
                    setSuccessTransaction={() => {
                        setAmount(Math.floor(availableBalance / instrument.price.close))
                        setPrice(instrument.price.close)
                        setTime(1)
                    }}
                    setFailTransaction={() => {
                        setAmount(Math.ceil(availableBalance / instrument.price.close) + 1)
                        setPrice(instrument.price.close)
                        setTime(1)
                    }}
                    setTimeoutTransaction={() => {
                        setAmount(Math.floor(availableBalance / instrument.price.close))
                        setPrice(instrument.price.close / 1000)
                        setTime(1)
                    }}
                />
            </div>
        </form>
    )
}
