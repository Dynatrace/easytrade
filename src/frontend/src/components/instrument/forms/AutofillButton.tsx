import React, { useRef, useState } from "react"

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
    const [dropdownStyle, setDropdownStyle] = useState<React.CSSProperties>({})
    const btnRef = useRef<HTMLButtonElement>(null)

    function openDropdown() {
        if (btnRef.current) {
            const rect = btnRef.current.getBoundingClientRect()
            setDropdownStyle({
                position: "fixed",
                top: rect.bottom + 4,
                left: rect.left,
                zIndex: 1000,
                minWidth: rect.width,
            })
        }
        setOpen(true)
    }

    return (
        <div>
            <button
                ref={btnRef}
                type="button"
                className="btn btn-secondary"
                onClick={() => (open ? setOpen(false) : openDropdown())}
            >
                Autofill
            </button>
            {open && (
                <>
                    <div
                        style={{ position: "fixed", inset: 0, zIndex: 999 }}
                        onClick={() => setOpen(false)}
                    />
                    <div className="profile-dropdown" style={dropdownStyle}>
                        <ul>
                            <li>
                                <button
                                    type="button"
                                    onClick={() => { setSuccessTransaction(); setOpen(false) }}
                                >
                                    Success transaction
                                </button>
                            </li>
                            <li>
                                <button
                                    type="button"
                                    onClick={() => { setFailTransaction(); setOpen(false) }}
                                >
                                    Fail transaction
                                </button>
                            </li>
                            <li>
                                <button
                                    type="button"
                                    onClick={() => { setTimeoutTransaction(); setOpen(false) }}
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
