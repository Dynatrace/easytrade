import React from "react"
import DepositForm from "../../components/forms/DepositForm"
import DemoAppWarning from "../../components/DemoAppWarning"
import { deposit } from "../../api/creditCard/deposit/deposit"

export default function Deposit() {
    return (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "1rem" }}>
            <DemoAppWarning />
            <DepositForm submitHandler={deposit} />
        </div>
    )
}
