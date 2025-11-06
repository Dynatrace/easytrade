import React from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { FormContainer } from "react-hook-form-mui"
import { z } from "zod"
import { NumberFormField } from "../../NumberFormField"
import { Button, CardActions, Stack } from "@mui/material"
import { useEffect } from "react"
import { useInstrument } from "../../../contexts/InstrumentContext/context"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { quickTransactionInvalidateQuery } from "../../../contexts/QueryContext/user/queries"
import useStatusDisplay from "../../../hooks/useStatusDisplay"
import StatusDisplay from "../../StatusDisplay"
import { useAuthUserData } from "../../../contexts/UserContext/hooks"

const formSchema = z
    .object({
        amount: z
            .number({ error: "Amount is required" })
            .positive("Amount must be greater than 0"),
        price: z
            .number({ error: "Price is required" })
            .positive("Price must be grater than 0"),
        currentBalance: z.number({
            error: "Current balance is required",
        }),
        total: z.number({ error: "Total price is required" }),
    })
    .refine(
        ({ amount, price, currentBalance }) => amount * price <= currentBalance,
        { message: "Total price can't exceed current balance", path: ["total"] }
    )

export type FormData = z.infer<typeof formSchema>

export default function QuickBuyForm() {
    const { balance } = useAuthUserData()
    const { instrument, quickBuyHandler } = useInstrument()
    const formContext = useForm<FormData>({
        values: {
            amount: 0,
            price: instrument.price.close,
            currentBalance: balance?.value ?? 0,
            total: 0,
        },
        resolver: zodResolver(formSchema),
    })
    const { setError, setSuccess, resetStatus, statusContext } =
        useStatusDisplay()
    const { watch, setValue, reset } = formContext

    useEffect(() => {
        const amount = watch("amount") ?? 0
        setValue("total", amount * instrument.price.close)
    }, [watch("amount")])

    useEffect(() => {
        const { unsubscribe } = watch((data, { type }) => {
            if (type === "change") {
                resetStatus()
            }
        })
        return unsubscribe
    }, [watch("amount")])

    const queryClient = useQueryClient()
    const { mutate, isPending } = useMutation({
        mutationFn: async (amount: number): Promise<void> => {
            const { error } = await quickBuyHandler(amount)
            if (error !== undefined) {
                throw error
            }
        },
        onMutate: resetStatus,
        onSuccess: async () => {
            setSuccess("Transaction successful")
            reset()
            await quickTransactionInvalidateQuery(queryClient)
        },
        onError: setError,
    })

    return (
        <FormContainer
            onSuccess={({ amount }: FormData) => mutate(amount)}
            formContext={formContext}
        >
            <Stack direction={"column"} spacing={2} minWidth={300}>
                <NumberFormField
                    id="amount"
                    name="amount"
                    label="Amount"
                    type="number"
                    required
                    autoFocus
                    fullWidth
                />
                <NumberFormField
                    id="price"
                    name="price"
                    label="Instrument price"
                    type="number"
                    required
                    fullWidth
                    slotProps={{ htmlInput: { readOnly: true } }}
                />
                <NumberFormField
                    id="currentBalance"
                    name="currentBalance"
                    label="Current balance"
                    type="number"
                    required
                    fullWidth
                    slotProps={{ htmlInput: { readOnly: true } }}
                />
                <NumberFormField
                    name="total"
                    label="Total price"
                    type="number"
                    required
                    fullWidth
                    slotProps={{ htmlInput: { readOnly: true } }}
                />
                <CardActions sx={{ justifyContent: "center" }}>
                    <Button
                        id="submitButton"
                        loading={isPending}
                        type="submit"
                        variant="outlined"
                    >
                        Buy
                    </Button>
                </CardActions>

                <StatusDisplay {...statusContext} />
            </Stack>
        </FormContainer>
    )
}
