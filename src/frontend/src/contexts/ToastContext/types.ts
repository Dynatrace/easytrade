export type ToastVariant = "success" | "error" | "info"

export type ToastEntry = {
    id: number
    variant: ToastVariant
    message: string
}

export type IToastContext = {
    showToast: (message: string, variant?: ToastVariant) => void
}
