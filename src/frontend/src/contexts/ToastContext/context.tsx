import React, { createContext, PropsWithChildren, useCallback, useContext, useState } from "react"
import { IToastContext, ToastEntry, ToastVariant } from "./types"

const ToastContext = createContext<IToastContext>({ showToast: () => {} })

let _nextId = 0

export function ToastProvider({ children }: PropsWithChildren) {
    const [toasts, setToasts] = useState<ToastEntry[]>([])

    const dismiss = useCallback((id: number) => {
        setToasts(prev => prev.filter(t => t.id !== id))
    }, [])

    const showToast = useCallback((message: string, variant: ToastVariant = "success") => {
        const id = ++_nextId
        setToasts(prev => [...prev, { id, variant, message }])
        setTimeout(() => dismiss(id), 4000)
    }, [dismiss])

    return (
        <ToastContext.Provider value={{ showToast }}>
            {children}
            <div className="toast-container" aria-live="polite">
                {toasts.map(t => (
                    <div
                        key={t.id}
                        className={`toast toast-${t.variant}`}
                        role={t.variant === "error" ? "alert" : "status"}
                    >
                        <span className="toast-message">{t.message}</span>
                        <button
                            type="button"
                            className="btn btn-ghost btn-icon toast-close"
                            onClick={() => dismiss(t.id)}
                            aria-label="Dismiss"
                        >
                            ✕
                        </button>
                    </div>
                ))}
            </div>
        </ToastContext.Provider>
    )
}

export function useToast(): IToastContext {
    const context = useContext(ToastContext)
    if (context === null) {
        throw new Error(
            "Components using [useToast] hook need to be wrapped in [ToastProvider]"
        )
    }
    return context
}
