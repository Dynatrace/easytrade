import React from "react"
import CreditCardForm from "../../../components/creditCard/CreditCardForm"
import DemoAppWarning from "../../../components/DemoAppWarning"

export default function CreditCardOrder() {
    return (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "1rem", maxWidth: 450 }}>
            <DemoAppWarning />
            <CreditCardForm />
        </div>
    )
}
