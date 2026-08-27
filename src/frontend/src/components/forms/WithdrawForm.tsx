import React, { useState } from "react"
import { useAuthUserData } from "../../contexts/UserContext/hooks"
import StatusDisplay from "../StatusDisplay"
import useStatusDisplay from "../../hooks/useStatusDisplay"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useAuthUser } from "../../contexts/UserContext/context"
import { WithdrawHandler } from "../../api/creditCard/withdraw/types"
import { balanceInvalidateQuery } from "../../contexts/QueryContext/user/queries"
import { useFormatter } from "../../contexts/FormatterContext/context"
import { EditIcon } from "../icons"
import { isCreditCardValid } from "../../utils/cardValidation"

type WithdrawFormProps = {
    submitHandler: WithdrawHandler
}

export default function WithdrawForm({ submitHandler }: WithdrawFormProps) {
    const { user, balance } = useAuthUserData()
    const { userId } = useAuthUser()
    const { formatCurrency } = useFormatter()

    const [amount, setAmount] = useState(0)
    const [cardholderName, setCardholderName] = useState("")
    const [address, setAddress] = useState("")
    const [email, setEmail] = useState("")
    const [cardNumber, setCardNumber] = useState("")
    const [cardType, setCardType] = useState("")
    const [agreementCheck, setAgreementCheck] = useState(false)
    const [validationError, setValidationError] = useState<string | null>(null)

    const { setError, setSuccess, resetStatus, statusContext } = useStatusDisplay()

    function autofillForm() {
        if (amount === 0) setAmount(1000)
        setCardholderName((user?.firstName ?? "") + " " + (user?.lastName ?? ""))
        setAddress(user?.address ?? "Kochweg 4 01510 Kronach")
        setEmail(user?.email ?? "mockemail@mail.com")
        setCardNumber("2293562484488276")
        setCardType("visaDebit")
        setAgreementCheck(true)
        setValidationError(null)
        resetStatus()
    }

    function autofillCardNumber() {
        setCardNumber("2293562484488276")
        resetStatus()
    }

    function validate(): string | null {
        if (amount <= 0) return "Amount must be greater than 0"
        if (!cardholderName.trim()) return "Cardholder name is required"
        if (!address.trim()) return "Address is required"
        if (!email.trim() || !email.includes("@")) return "Invalid email"
        if (!cardNumber.trim()) return "Card number is required"
        if (!isCreditCardValid(cardNumber)) return "Invalid credit card number"
        if (!cardType) return "Must set card type"
        if (!agreementCheck) return "Must agree to terms and conditions"
        return null
    }

    const queryClient = useQueryClient()
    const { mutate, isPending } = useMutation({
        mutationFn: async () => {
            const err = validate()
            if (err) { setValidationError(err); throw err }
            setValidationError(null)
            const { error } = await submitHandler({
                name: cardholderName,
                accountId: userId,
                amount,
                address,
                email,
                cardNumber,
                cardType,
            })
            if (error !== undefined) throw error
        },
        onMutate: resetStatus,
        onSuccess: async () => {
            setSuccess("Withdraw successful")
            await balanceInvalidateQuery(queryClient)
            setAmount(0); setCardholderName(""); setAddress(""); setEmail("")
            setCardNumber(""); setCardType(""); setAgreementCheck(false)
            setValidationError(null)
        },
        onError: (e: unknown) => {
            const msg = typeof e === "string" ? e : ((e instanceof Error) ? e.message : String(e))
            if (validationError === msg) return
            setError(msg)
        },
    })

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault()
        mutate()
    }

    const currentBalance = balance?.value === undefined
        ? "Loading..."
        : formatCurrency(balance.value)

    return (
        <form className="form" onSubmit={handleSubmit} style={{ width: "100%", maxWidth: 420 }}>
            <div className="form-group">
                <label className="form-label">Current balance</label>
                <input type="text" value={currentBalance} readOnly />
            </div>
            <div className="form-group">
                <label className="form-label" htmlFor="amount">Amount *</label>
                <input
                    id="amount"
                    type="number"
                    min={0}
                    step="any"
                    value={amount}
                    autoFocus
                    onChange={(e) => { setAmount(Number(e.target.value)); resetStatus(); setValidationError(null) }}
                />
            </div>
            <div className="form-group">
                <label className="form-label" htmlFor="cardholderName">Cardholder name *</label>
                <input
                    id="cardholderName"
                    type="text"
                    value={cardholderName}
                    onChange={(e) => { setCardholderName(e.target.value); resetStatus(); setValidationError(null) }}
                />
            </div>
            <div className="form-group">
                <label className="form-label" htmlFor="address">Address *</label>
                <input
                    id="address"
                    type="text"
                    value={address}
                    onChange={(e) => { setAddress(e.target.value); resetStatus(); setValidationError(null) }}
                />
            </div>
            <div className="form-group">
                <label className="form-label" htmlFor="email">Email *</label>
                <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => { setEmail(e.target.value); resetStatus(); setValidationError(null) }}
                />
            </div>
            <div className="form-group">
                <label className="form-label" htmlFor="cardNumber">Card number *</label>
                <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
                    <input
                        id="cardNumber"
                        type="text"
                        value={cardNumber}
                        onChange={(e) => { setCardNumber(e.target.value); resetStatus(); setValidationError(null) }}
                        style={{ flex: 1 }}
                    />
                    <button type="button" className="btn btn-ghost" onClick={autofillCardNumber} title="Autofill card number">
                        <EditIcon />
                    </button>
                </div>
            </div>
            <div className="form-group">
                <label className="form-label" htmlFor="cardType">Card type *</label>
                <select
                    id="cardType"
                    value={cardType}
                    onChange={(e) => { setCardType(e.target.value); resetStatus(); setValidationError(null) }}
                >
                    <option value="">Select card type</option>
                    <option value="visaDebit">Visa Debit</option>
                    <option value="visaCredit">Visa Credit</option>
                    <option value="mastercard">Mastercard</option>
                    <option value="americanExpress">American Express</option>
                </select>
            </div>
            <div className="form-group" style={{ flexDirection: "row", alignItems: "center", gap: "0.5rem" }}>
                <input
                    id="agreement"
                    type="checkbox"
                    checked={agreementCheck}
                    onChange={(e) => { setAgreementCheck(e.target.checked); resetStatus(); setValidationError(null) }}
                    style={{ width: "auto" }}
                />
                <label htmlFor="agreement" style={{ marginBottom: 0 }}>Agree to terms and conditions *</label>
            </div>
            <p style={{ fontSize: "0.8rem", color: "var(--text-muted)", margin: "0.25rem 0" }}>* Required field</p>
            {validationError && (
                <div className="status-message status-error">{validationError}</div>
            )}
            <div className="form-actions">
                <button id="submitButton" type="submit" className="btn btn-primary" disabled={isPending}>
                    {isPending ? <span className="spinner" /> : null}
                    Withdraw
                </button>
                <button id="autofillButton" type="button" className="btn btn-secondary" onClick={autofillForm}>
                    Autofill
                </button>
            </div>
            <StatusDisplay {...statusContext} />
        </form>
    )
}
