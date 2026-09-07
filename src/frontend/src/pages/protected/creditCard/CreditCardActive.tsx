import { useToast } from "../../../contexts/ToastContext/context"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useAuthUser } from "../../../contexts/UserContext/context"
import { revokeCreditCard } from "../../../api/creditCard/order"
import { deleteCardInvalidateQuery } from "../../../contexts/QueryContext/creditCard/queries"

export default function CreditCardActive() {
    const { userId } = useAuthUser()
    const queryClient = useQueryClient()
    const { showToast } = useToast()
    const { mutate, isPending } = useMutation({
        mutationFn: async () => {
            const response = await revokeCreditCard(userId)
            if (response.type === "error") throw response.error
        },
        onSuccess: async () => {
            await deleteCardInvalidateQuery(queryClient)
            showToast("Card has been successfully revoked.", "success")
        },
        onError: (error: string) => { showToast(error, "error") },
    })
    return (
        <div className="page-centered">
            <div className="card" style={{ padding: "1.5rem", maxWidth: 450, display: "flex", flexDirection: "column", alignItems: "center", gap: "1rem", width: "100%" }}>
                <p style={{ textAlign: "center", margin: 0 }}>
                    You already have an active credit card. Only one credit card can be active at a time.
                </p>
                <button
                    id="revoke-card"
                    type="button"
                    className="btn btn-danger"
                    disabled={isPending}
                    onClick={() => mutate()}
                >
                    {isPending ? <span className="spinner" /> : null}
                    Revoke card
                </button>
            </div>
        </div>
    )
}
