import React, { useEffect } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import {
    Button,
    CardActions,
    TextField,
    Typography,
} from "@mui/material"
import { useForm } from "react-hook-form"
import { CheckboxElement, FormContainer, TextFieldElement } from "react-hook-form-mui"
import { z } from "zod"
import { Stack } from "@mui/system"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useAuthUser } from "../../contexts/UserContext/context"
import { useAuthUserData } from "../../contexts/UserContext/hooks"
import { useFormatter } from "../../contexts/FormatterContext/context"
import useStatusDisplay from "../../hooks/useStatusDisplay"
import StatusDisplay from "../StatusDisplay"
import CheckboxLabel from "../CheckboxLabel"
import { NumberFormField } from "../NumberFormField"
import { balanceInvalidateQuery } from "../../contexts/QueryContext/user/queries"
import { BitcoinDepositHandler } from "../../api/bitcoin/deposit/types"

// Mock BTC/USD rate — must stay in sync with broker-service BalanceService.BtcToUsdRate
const BTC_TO_USD_RATE = 65000

const btcWalletRegex = /^(bc1|[13])[a-zA-HJ-NP-Z0-9]{25,62}$/

const formSchema = z.object({
    btcAmount: z
        .number({ required_error: "BTC amount is required" })
        .positive("BTC amount must be greater than 0"),
    walletAddress: z
        .string()
        .min(1, "Wallet address is required")
        .regex(btcWalletRegex, "Invalid Bitcoin wallet address"),
    agreementCheck: z
        .boolean()
        .refine((checked) => checked, "Must agree to terms and conditions"),
})

export type BitcoinFormData = z.infer<typeof formSchema>

const defaultValues: BitcoinFormData = {
    btcAmount: 0,
    walletAddress: "",
    agreementCheck: false,
}

type BitcoinDepositFormProps = {
    submitHandler: BitcoinDepositHandler
}

export default function BitcoinDepositForm({ submitHandler }: BitcoinDepositFormProps) {
    const { balance } = useAuthUserData()
    const { userId } = useAuthUser()
    const { formatCurrency } = useFormatter()

    const formContext = useForm<BitcoinFormData>({
        defaultValues,
        resolver: zodResolver(formSchema),
        resetOptions: { keepDefaultValues: true },
    })
    const { watch, reset, getValues } = formContext
    const { setError, setSuccess, resetStatus, statusContext } = useStatusDisplay()

    const btcAmount = watch("btcAmount")
    const usdPreview = btcAmount > 0 ? btcAmount * BTC_TO_USD_RATE : 0

    function autofillForm() {
        if (getValues().btcAmount === defaultValues.btcAmount) {
            formContext.setValue("btcAmount", 0.01, { shouldValidate: true })
        }
        formContext.setValue("walletAddress", "1A1zP1eP5QGefi2DMPTfTL5SLmv7Divfna", {
            shouldValidate: true,
        })
        formContext.setValue("agreementCheck", true, { shouldValidate: true })
    }

    const queryClient = useQueryClient()
    const { mutate, isPending } = useMutation({
        mutationFn: async ({
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            agreementCheck,
            ...rest
        }: BitcoinFormData) => {
            const { error } = await submitHandler({
                accountId: Number(userId),
                ...rest,
            })
            if (error !== undefined) {
                throw error
            }
        },
        onMutate: resetStatus,
        onSuccess: async () => {
            setSuccess("Bitcoin deposit successful")
            await balanceInvalidateQuery(queryClient)
            reset()
        },
        onError: setError,
    })

    useEffect(() => {
        const { unsubscribe } = watch(() => {
            resetStatus()
        })
        return unsubscribe
    }, [watch])

    return (
        <FormContainer
            onSuccess={(data: BitcoinFormData) => mutate(data)}
            formContext={formContext}
        >
            <Stack direction={"column"} spacing={2}>
                <TextField
                    name="balance"
                    label="Current balance"
                    value={
                        balance?.value === undefined
                            ? "Loading..."
                            : formatCurrency(balance.value)
                    }
                    disabled
                    fullWidth
                    slotProps={{ htmlInput: { "data-dt-content": true } }}
                />
                <NumberFormField
                    id="btcAmount"
                    name="btcAmount"
                    label="BTC Amount"
                    type="number"
                    required
                    autoFocus
                    fullWidth
                    slotProps={{ htmlInput: { "data-dt-content": true } }}
                />
                {usdPreview > 0 && (
                    <Typography variant="body2" color="text.secondary">
                        ≈ {formatCurrency(usdPreview)} USD at current rate
                    </Typography>
                )}
                <TextFieldElement
                    id="walletAddress"
                    name="walletAddress"
                    label="Bitcoin wallet address"
                    required
                    fullWidth
                    slotProps={{ htmlInput: { "data-dt-content": true } }}
                />
                <CheckboxElement
                    id="agreement"
                    name="agreementCheck"
                    label={
                        <CheckboxLabel
                            text="Agree to terms and conditions *"
                            hasErrors={!!formContext.formState.errors.agreementCheck}
                        />
                    }
                    required
                />
                <Typography variant="body2">* Required field</Typography>
                <CardActions sx={{ justifyContent: "center" }}>
                    <Button
                        id="submitButton"
                        loading={isPending}
                        type="submit"
                        variant="outlined"
                    >
                        Deposit
                    </Button>
                    <Button type="button" variant="outlined" onClick={autofillForm}>
                        Autofill
                    </Button>
                </CardActions>
                <StatusDisplay {...statusContext} />
            </Stack>
        </FormContainer>
    )
}
