import React, { useState } from "react"

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
    const [open, setOpen] = useState(false)

    return (
        <div style={{ position: "relative" }}>
            <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setOpen((v) => !v)}
            >
                Autofill
            </button>
            {open && (
                <>
                    <div
                        style={{ position: "fixed", inset: 0, zIndex: 99 }}
                        onClick={() => setOpen(false)}
                    />
                    <div
                        className="profile-dropdown"
                        style={{ left: 0, right: "auto", zIndex: 100 }}
                    >
                        <ul>
                            <li>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setSuccessTransaction()
                                        setOpen(false)
                                    }}
                                >
                                    Success transaction
                                </button>
                            </li>
                            <li>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setFailTransaction()
                                        setOpen(false)
                                    }}
                                >
                                    Fail transaction
                                </button>
                            </li>
                            <li>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setTimeoutTransaction()
                                        setOpen(false)
                                    }}
                                >
                                    Timeout transaction
                                </button>
                            </li>
                        </ul>
                    </div>
                </>
            )}
        </div>
    )
}
