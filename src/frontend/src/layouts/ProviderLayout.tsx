import { QueryClientProvider } from "@tanstack/react-query"
import { ReactQueryDevtools } from "@tanstack/react-query-devtools"
import { login } from "../api/user"
import { AuthProvider } from "../contexts/AuthContext"
import { FormatterProvider } from "../contexts/FormatterContext/context"
import { ToastProvider } from "../contexts/ToastContext/context"
import { queryClient } from "../utils/queryClient"
import AppLayout from "./AppLayout"

export default function ProviderLayout() {
    return (
        <FormatterProvider currency="USD" locale="en-US">
            <ToastProvider>
                <QueryClientProvider client={queryClient}>
                    <AuthProvider loginHandler={login}>
                        <AppLayout />
                    </AuthProvider>
                    {import.meta.env.DEV && (
                        <ReactQueryDevtools initialIsOpen={false} />
                    )}
                </QueryClientProvider>
            </ToastProvider>
        </FormatterProvider>
    )
}
