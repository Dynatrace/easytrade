import React from "react"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useAuthUser } from "../../../contexts/UserContext/context"
import { revokeCreditCard } from "../../../api/creditCard/order"
import useStatusDisplay from "../../../hooks/useStatusDisplay"
import StatusDisplay from "../../../components/StatusDisplay"
import { deleteCardInvalidateQuery } from "../../../contexts/QueryContext/creditCard/queries"

export default function CreditCardActive() {
    const { userId } = useAuthUser()
    const queryClient = useQueryClient()
    const { resetStatus, setError, setSuccess, statusContext } = useStatusDisplay()
    const { mutate, isPending } = useMutation({
        mutationFn: async () => {
            const response = await revokeCreditCard(userId)
            if (response.type === "error") throw response.error
        },
        onMutate: () => { resetStatus() },
        onSuccess: async () => {
            await deleteCardInvalidateQuery(queryClient)
            setSuccess("Card has been successfully revoked.")
        },
        onError: (error: string) => { setError(error) },
    })
    return (
        <div className="card" style={{ padding: "1rem", maxWidth: 450, display: "flex", flexDirection: "column", alignItems: "center", gap: "1rem" }}>
            <p style={{ textAlign: "center" }}>
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
            <StatusDisplay {...statusContext} />
        </div>
    )
}
