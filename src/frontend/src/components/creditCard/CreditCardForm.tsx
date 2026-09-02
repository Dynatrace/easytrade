import { useToast } from "../../contexts/ToastContext/context"
import React, { useState } from "react"
import { useAuthUser } from "../../contexts/UserContext/context"
import { useMutation, useQueryClient } from "@tanstack/react-query"


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

    const { showToast } = useToast()

    function autofill() {
        if (user === undefined) {
            showToast("Couldn't get proper data to fill form.", "error")
            return
        }
        setName(`${user.firstName} ${user.lastName}`)
        setAddress(user.address)
        setEmail(user.email)
        setType("silver")
        setAgreementCheck(true)
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
            if (err) throw err
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
        onSuccess: async ({ orderId }) => {
            showToast(`Card ordered successfully. Order ID: ${orderId}`, "success")
            setName(""); setAddress(""); setEmail(""); setType(""); setAgreementCheck(false)
            await newCardOrderInvalidateQuery(queryClient)
        },
        onError: (e: unknown) => {
            showToast(typeof e === "string" ? e : ((e instanceof Error) ? e.message : String(e)), "error")
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
                    onChange={(e) => setName(e.target.value)}
                />
            </div>
            <div className="form-group">
                <label className="form-label" htmlFor="address">Cardholder address *</label>
                <input
                    id="address"
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                />
            </div>
            <div className="form-group">
                <label className="form-label" htmlFor="email">Email *</label>
                <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                />
            </div>
            <div className="form-group">
                <label className="form-label" htmlFor="type">Card type *</label>
                <select
                    id="type"
                    value={type}
                    onChange={(e) => setType(e.target.value)}
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
                    style={{ width: "auto" }}
                    onChange={(e) => setAgreementCheck(e.target.checked)}
                />
                <label htmlFor="agreement" style={{ marginBottom: 0 }}>Agree to terms and conditions *</label>
            </div>
            <p style={{ fontSize: "0.8rem", color: "var(--text-muted)", margin: "0.25rem 0" }}>* Required field</p>
            <div className="form-actions">
                <button id="submitButton" type="submit" className="btn btn-primary" disabled={isPending}>
                    {isPending ? <span className="spinner" /> : null}
                    Order card
                </button>
                <button type="button" className="btn btn-secondary" onClick={autofill}>
                    Autofill
                </button>
            </div>
        </form>
    )
}
