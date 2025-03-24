import React from "react"
import { Stack, TextField } from "@mui/material"
import { useAuthUserData } from "../contexts/UserContext/hooks"
import { useFormatter } from "../contexts/FormatterContext/context"

export default function AccountInfo() {
    const { user, balance } = useAuthUserData()
    const { formatCurrency } = useFormatter()
    return (
        <Stack direction="row" spacing={2} justifyContent="center">
            <TextField
                id="currentBalance"
                name="balance"
                label="Current balance"
                value={
                    balance?.value === undefined
                        ? "Loading..."
                        : formatCurrency(balance.value)
                }
                disabled
                slotProps={{
                    htmlInput: { "data-dt-content": true },
                }}
            />
            <TextField
                name="package"
                label="Package type"
                value={user?.packageType ?? "Loading..."}
                disabled
                slotProps={{
                    htmlInput: { "data-dt-content": true },
                }}
            />
        </Stack>
    )
}
