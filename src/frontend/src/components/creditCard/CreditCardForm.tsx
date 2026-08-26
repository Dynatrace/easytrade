import React, { useState } from "react"
import { useAuthUser } from "../../contexts/UserContext/context"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import useStatusDisplay from "../../hooks/useStatusDisplay"
import StatusDisplay from "../StatusDisplay"
import { useAuthUserData } from "../../contexts/UserContext/hooks"
import { orderCreditCard } from "../../api/creditCard/order"
import { CreditCardLevel } from "../../api/backend/creditCard"
import { newCardOrderInvalidateQuery } from "../../contexts/QueryContext/creditCard/queries"

export default function CreditCardForm() {
    const { userId } = useAuthUser()
    const { user } = useAuthUserData()

    const [name, setName] = useState("")
    const [address, setAddress] = useState("")
    const [email, setEmail] = useState("")
    const [type, setType] = useState("")
    const [agreementCheck, setAgreementCheck] = useState(false)
    const [validationError, setValidationError] = useState<string | null>(null)

    const { setError, setSuccess, resetStatus, statusContext } = useStatusDisplay()

    function autofill() {
        if (user === undefined) {
            setError("Couldn't get proper data to fill form.")
            return
        }
        setName(`${user.firstName} ${user.lastName}`)
        setAddress(user.address)
        setEmail(user.email)
        setType("silver")
        setAgreementCheck(true)
        setValidationError(null)
        resetStatus()
    }

    function validate(): string | null {
        if (!name.trim()) return "Cardholder name is required."
        if (!address.trim()) return "Cardholder address is required."
        if (!email.trim() || !email.includes("@")) return "Provide a valid email."
        if (!type) return "Card type is required."
        if (!agreementCheck) return "Must agree to terms and conditions"
        return null
    }

    const queryClient = useQueryClient()
    const { mutate, isPending } = useMutation({
        mutationFn: async () => {
            const err = validate()
            if (err) { setValidationError(err); throw err }
            setValidationError(null)
            const cardLevel = type as CreditCardLevel
            const response = await orderCreditCard(userId, {
                cardLevel,
                email,
                name,
                shippingAddress: address,
            })
            if (response.type === "error") throw response.error
            return { orderId: response.creditCardOrderId }
        },
        onMutate: resetStatus,
        onSuccess: async ({ orderId }) => {
            setSuccess(`Card orderred successfully. Order ID: ${orderId}`)
            setName(""); setAddress(""); setEmail(""); setType(""); setAgreementCheck(false)
            setValidationError(null)
            await newCardOrderInvalidateQuery(queryClient)
        },
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        onError: (e: any) => {
            if (typeof e === "string" && validationError === e) return
            setError(typeof e === "string" ? e : (e?.message ?? String(e)))
        },
    })

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault()
        mutate()
    }

    return (
        <form className="form" onSubmit={handleSubmit} style={{ width: "100%", minWidth: 300 }}>
            <div className="form-group">
                <label className="form-label" htmlFor="name">Cardholder name *</label>
                <input
                    id="name"
                    type="text"
                    value={name}
                    onChange={(e) => { setName(e.target.value); resetStatus(); setValidationError(null) }}
                />
            </div>
            <div className="form-group">
                <label className="form-label" htmlFor="address">Cardholder address *</label>
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
                <label className="form-label" htmlFor="type">Card type *</label>
                <select
                    id="type"
                    value={type}
                    onChange={(e) => { setType(e.target.value); resetStatus(); setValidationError(null) }}
                >
                    <option value="">Select card type</option>
                    <option value="silver">Silver</option>
                    <option value="gold">Gold</option>
                    <option value="platinum">Platinum</option>
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
                    Order card
                </button>
                <button type="button" className="btn btn-secondary" onClick={autofill}>
                    Autofill
                </button>
            </div>
            <StatusDisplay {...statusContext} />
        </form>
    )
}
