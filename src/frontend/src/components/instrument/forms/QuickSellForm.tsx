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

const formSchema = z
    .object({
        amount: z
            .number({ error: "Amount is required" })
            .positive("Amount must be greater than 0"),
        price: z
            .number({ error: "Price is required" })
            .positive("Price must be grater than 0"),
        possessedAmount: z.number({
            error: "Possessed amount is required",
        }),
        total: z.number({ error: "Total price is required" }),
    })
    .refine(({ amount, possessedAmount }) => amount <= possessedAmount, {
        message: "Can't sell more assets than possessed",
        path: ["amount"],
    })

export type FormData = z.infer<typeof formSchema>

export default function QuickSellForm() {
    const { instrument, quickSellHandler } = useInstrument()
    const formContext = useForm<FormData>({
        values: {
            amount: 0,
            price: instrument.price.close,
            possessedAmount: instrument.amount,
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
            const { error } = await quickSellHandler(amount)
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
                    id="posessedAmount"
                    name="possessedAmount"
                    label="Possessed amount"
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
                        Sell
                    </Button>
                </CardActions>
                <StatusDisplay {...statusContext} />
            </Stack>
        </FormContainer>
    )
}
