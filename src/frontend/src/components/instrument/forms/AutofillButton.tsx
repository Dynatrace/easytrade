import React from "react"
import { Button, Menu, MenuItem } from "@mui/material"
import { useState } from "react"

interface AutofillButtonProps {
    setSuccessTransaction: () => void
    setFailTransaction: () => void
    setTimeoutTransaction: () => void
}

export function AutofillButton({
    setSuccessTransaction,
    setFailTransaction,
    setTimeoutTransaction,
}: AutofillButtonProps) {
    const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null)

    function handleClose() {
        setMenuAnchor(null)
    }

    return (
        <>
            <Button
                type="button"
                variant="outlined"
                onClick={({ currentTarget }) => setMenuAnchor(currentTarget)}
            >
                Autofill
            </Button>
            <Menu
                open={!!menuAnchor}
                anchorEl={menuAnchor}
                onClose={handleClose}
                onClick={handleClose}
            >
                <MenuItem onClick={setSuccessTransaction}>
                    Success transaction
                </MenuItem>
                <MenuItem onClick={setFailTransaction}>
                    Fail transaction
                </MenuItem>
                <MenuItem onClick={setTimeoutTransaction}>
                    Timeout transaction
                </MenuItem>
            </Menu>
        </>
    )
}
