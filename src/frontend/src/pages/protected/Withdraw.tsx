import React from "react"
import WithdrawForm from "../../components/forms/WithdrawForm"
import DemoAppWarning from "../../components/DemoAppWarning"
import { withdraw } from "../../api/creditCard/withdraw/withdraw"

export default function Withdraw() {
    return (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "1rem" }}>
            <DemoAppWarning />
            <WithdrawForm submitHandler={withdraw} />
        </div>
    )
}
