import { Stack, TextField } from "@mui/material"
import { useAuthUserData } from "../contexts/UserContext/hooks"

export default function AccountInfo() {
    const authUserData = useAuthUserData()
    const user = authUserData.user,
        balance = authUserData.balance
    return (
        <Stack direction="row" spacing={2} justifyContent="center">
            <TextField
                id="currentBalance"
                name="balance"
                label="Current balance"
                value={balance?.value ?? "Loading..."}
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
