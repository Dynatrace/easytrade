import React from "react"
import CreditCardForm from "../../../components/creditCard/CreditCardForm"
import DemoAppWarning from "../../../components/DemoAppWarning"

export default function CreditCardOrder() {
    return (
        <div className="page-centered">
            <div style={{ display: "flex", flexDirection: "column", gap: "1rem", width: "100%", maxWidth: 480 }}>
                <DemoAppWarning />
                <CreditCardForm />
            </div>
        </div>
    )
}
