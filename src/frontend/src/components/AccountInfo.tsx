import React from "react"
import { useAuthUserData } from "../contexts/UserContext/hooks"
import { useFormatter } from "../contexts/FormatterContext/context"

export default function AccountInfo() {
    const { user, balance } = useAuthUserData()
    const { formatCurrency } = useFormatter()

    return (
        <div style={{ display: "flex", gap: "var(--space-6)", flexWrap: "wrap", alignItems: "flex-end" }}>
            <div className="form-group">
                <span className="form-label">Current balance</span>
                <span
                    id="currentBalance"
                    className="balance-display"
                    data-dt-content
                >
                    {balance?.value === undefined
                        ? "Loading..."
                        : formatCurrency(balance.value)}
                </span>
            </div>
            <div className="form-group">
                <span className="form-label">Package type</span>
                <span className="balance-display" data-dt-content>
                    {user?.packageType ?? "Loading..."}
                </span>
            </div>
        </div>
    )
}
