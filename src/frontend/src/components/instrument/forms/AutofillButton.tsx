import React, { useRef, useState } from "react"
import { createPortal } from "react-dom"

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
        if (!btnRef.current) return
        const rect = btnRef.current.getBoundingClientRect()
        // Always open upward so the list doesn't push below the viewport
        setDropdownStyle({
            position: "fixed",
            top: "auto",          // neutralise the CSS class's top: calc(100% + …)
            right: "auto",        // neutralise the CSS class's right: 0
            bottom: window.innerHeight - rect.top + 4,
            left: rect.left,
            minWidth: rect.width,
            maxHeight: rect.top - 8,
            overflowY: "auto",
            zIndex: 9999,
        })
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

            {open &&
                createPortal(
                    <>
                        {/* Invisible backdrop — closes dropdown on outside click */}
                        <div
                            style={{ position: "fixed", inset: 0, zIndex: 9998 }}
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
                    </>,
                    document.body
                )}
        </div>
    )
}
