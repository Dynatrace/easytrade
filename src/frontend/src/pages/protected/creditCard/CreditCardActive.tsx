import React from "react"
import { Button, Card, CardContent, Stack, Typography } from "@mui/material"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useAuthUser } from "../../../contexts/UserContext/context"
import { revokeCreditCard } from "../../../api/creditCard/order"
import useStatusDisplay from "../../../hooks/useStatusDisplay"
import StatusDisplay from "../../../components/StatusDisplay"
import { deleteCardInvalidateQuery } from "../../../contexts/QueryContext/creditCard/queries"

export default function CreditCardActive() {
    const { userId } = useAuthUser()
    const queryClient = useQueryClient()
    const { resetStatus, setError, setSuccess, statusContext } =
        useStatusDisplay()
    const { mutate, isPending } = useMutation({
        mutationFn: async () => {
            const response = await revokeCreditCard(userId)
            if (response.type === "error") {
                throw response.error
            }
        },
        onMutate: () => {
            resetStatus()
        },
        onSuccess: async () => {
            await deleteCardInvalidateQuery(queryClient)
            setSuccess("Card has been successfully revoked.")
        },
        onError: (error: string) => {
            setError(error)
        },
    })
    return (
        <Card sx={{ padding: 1, maxWidth: "450px" }}>
            <CardContent>
                <Stack justifyContent="center" alignItems="center" spacing={2}>
                    <Typography>
                        You already have an active credit card. Only one credit
                        card can be active at a time.
                    </Typography>
                    <Button
                        id="revoke-card"
                        loading={isPending}
                        onClick={() => mutate()}
                        variant="outlined"
                    >
                        Revoke card
                    </Button>
                    <StatusDisplay {...statusContext} />
                </Stack>
            </CardContent>
        </Card>
    )
}
