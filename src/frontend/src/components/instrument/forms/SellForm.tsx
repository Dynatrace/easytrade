import React from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { UseFormSetValue, useForm } from "react-hook-form"
import { FormContainer } from "react-hook-form-mui"
import { z } from "zod"
import { NumberFormField } from "../../NumberFormField"
import { Button, CardActions, Stack } from "@mui/material"
import { useEffect } from "react"
import { useInstrument } from "../../../contexts/InstrumentContext/context"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { transactionInvalidateQuery } from "../../../contexts/QueryContext/user/queries"
import useStatusDisplay from "../../../hooks/useStatusDisplay"
import StatusDisplay from "../../StatusDisplay"
import { AutofillButton } from "./AutofillButton"

const formSchema = z.object({
    amount: z.coerce
        .number({ error: "Amount is required" })
        .positive("Amount must be greater than 0"),
    price: z.coerce
        .number({ error: "Price is required" })
        .positive("Price must be grater than 0"),
    time: z.coerce
        .number({ error: "Time range is required" })
        .min(1, "Time range must be at least 1h")
        .max(24, "Time range must be at most 24h"),
    total: z.number({ error: "Total price is required" }),
})

export type FormData = z.infer<typeof formSchema>

interface SellAutofillButtonProps {
    price: number
    amount: number
    setValue: UseFormSetValue<{
        amount: number
        price: number
        time: number
        total: number
    }>
}

function SellAutofillButton({
    price,
    amount,
    setValue,
}: SellAutofillButtonProps) {
    function setValues(
        sellAmount: number,
        sellPrice: number,
        sellTime: number
    ) {
        setValue("amount", sellAmount, {
            shouldValidate: false,
        })
        setValue("price", sellPrice, { shouldValidate: false })
        setValue("time", sellTime, { shouldValidate: false })
    }

    function setSuccessTransaction() {
        setValues(amount, price, 1)
    }

    function setFailTransaction() {
        setValues(amount + 1, price, 1)
    }

    function setTimeoutTransaction() {
        setValues(amount, price + 1000, 1)
    }

    return (
        <AutofillButton
            setSuccessTransaction={setSuccessTransaction}
            setFailTransaction={setFailTransaction}
            setTimeoutTransaction={setTimeoutTransaction}
        />
    )
}

export default function SellForm() {
    const { instrument, sellHandler } = useInstrument()

    const formContext = useForm<FormData>({
        defaultValues: {
            price: instrument.price.close,
            time: 1,
            total: 0,
        },
        resolver: zodResolver(formSchema),
        resetOptions: { keepDefaultValues: true },
    })
    const { setError, setSuccess, resetStatus, statusContext } =
        useStatusDisplay()
    const { watch, setValue, reset } = formContext

    useEffect(() => {
        const amount = Number(watch("amount", 0))
        const price = Number(watch("price", 0))
        setValue("total", amount * price)
    }, [watch(["amount", "price"])])

    useEffect(() => {
        const { unsubscribe } = watch((_data, { type }) => {
            if (type === "change") {
                resetStatus()
            }
        })
        return unsubscribe
    }, [watch(["amount", "price", "time"])])

    const queryClient = useQueryClient()
    const { mutate, isPending } = useMutation({
        mutationFn: async ({
            amount,
            price,
            time,
        }: FormData): Promise<void> => {
            const { error } = await sellHandler(amount, price, time)
            if (error !== undefined) {
                throw error
            }
        },
        onMutate: resetStatus,
        onSuccess: async () => {
            setSuccess("Transaction scheduled")
            reset()
            await transactionInvalidateQuery(queryClient)
        },
        onError: setError,
    })

    return (
        <FormContainer
            onSuccess={(data: FormData) => mutate(data)}
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
                />
                <NumberFormField
                    id="time"
                    name="time"
                    label="Time [h]"
                    type="number"
                    required
                    fullWidth
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
                    <Stack spacing={2} direction={"row"}>
                        <Button
                            id="submitButton"
                            loading={isPending}
                            type="submit"
                            variant="outlined"
                        >
                            Sell
                        </Button>
                        <SellAutofillButton
                            price={instrument.price.close}
                            amount={instrument.amount}
                            setValue={setValue}
                        />
                    </Stack>
                </CardActions>
                <StatusDisplay {...statusContext} />
            </Stack>
        </FormContainer>
    )
}
