import React from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import {
    Button,
    CardActions,
    IconButton,
    InputAdornment,
    TextField,
    Typography,
} from "@mui/material"
import { useForm } from "react-hook-form"
import {
    CheckboxElement,
    FormContainer,
    SelectElement,
    TextFieldElement,
} from "react-hook-form-mui"
import { z } from "zod"
import isCreditCard from "validator/lib/isCreditCard"
import { useEffect } from "react"
import { NumberFormField } from "../NumberFormField"
import CheckboxLabel from "../CheckboxLabel"
import { useAuthUserData } from "../../contexts/UserContext/hooks"
import useStatusDisplay from "../../hooks/useStatusDisplay"
import StatusDisplay from "../StatusDisplay"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useAuthUser } from "../../contexts/UserContext/context"
import { DepositHandler } from "../../api/creditCard/deposit/types"
import { Edit } from "@mui/icons-material"
import { balanceInvalidateQuery } from "../../contexts/QueryContext/user/queries"
import { Stack } from "@mui/system"
import { useFormatter } from "../../contexts/FormatterContext/context"

const cvvRegex = new RegExp(/^[0-9]{3,4}$/)

const formSchema = z.object({
    amount: z
        .number("Amount is required")
        .positive("Amount must be greater than 0"),
    cardholderName: z.string().min(1, "Cardholder name is required"),
    address: z.string().min(1, "Address is required"),
    email: z.email("Invalid email"),
    cardNumber: z
        .string()
        .min(1, "Card number is required")
        .refine(isCreditCard, "Invalid credit card number"),
    cardType: z.string().min(1, "Must set card type"),
    cvv: z.string().min(1, "CVV is required").regex(cvvRegex, "Invalid CVV"),
    agreementCheck: z
        .boolean()
        .refine((checked) => checked, "Must agree to terms and conditions"),
})

export type FormData = z.infer<typeof formSchema>

const defaultValues: FormData = {
    amount: 0,
    cardholderName: "",
    address: "",
    email: "",
    cardNumber: "",
    cardType: "",
    cvv: "",
    agreementCheck: false,
}

type DepositFormProps = {
    submitHandler: DepositHandler
}

export default function DepositForm({ submitHandler }: DepositFormProps) {
    const { user, balance } = useAuthUserData()
    const { userId } = useAuthUser()
    const { formatCurrency } = useFormatter()

    const formContext = useForm<FormData>({
        defaultValues,
        resolver: zodResolver(formSchema),
        resetOptions: { keepDefaultValues: true },
    })
    const { watch, reset, setValue, getValues } = formContext
    const { setError, setSuccess, resetStatus, statusContext } =
        useStatusDisplay()

    function autofillForm() {
        if (getValues().amount === defaultValues.amount) {
            setValue("amount", 1000, {
                shouldValidate: false,
            })
        }
        setValue("cardholderName", user?.firstName + " " + user?.lastName, {
            shouldValidate: false,
        })
        setValue("address", user?.address ?? "Kochweg 4 01510 Kronach", {
            shouldValidate: false,
        })
        setValue("email", user?.email ?? "mockemail@mail.com", {
            shouldValidate: false,
        })
        setValue("cardNumber", "2293562484488276", {
            shouldValidate: false,
        })
        setValue("cardType", "visaDebit", {
            shouldValidate: false,
        })
        setValue("cvv", "123", {
            shouldValidate: false,
        })
        setValue("agreementCheck", true, {
            shouldValidate: false,
        })
    }

    function autofillCardNumber() {
        setValue("cardNumber", "2293562484488276", {
            shouldValidate: false,
        })
    }

    const queryClient = useQueryClient()
    const { mutate, isPending } = useMutation({
        mutationFn: async ({
            cardholderName: name,
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            agreementCheck,
            ...rest
        }: FormData) => {
            const { error } = await submitHandler({
                name,
                accountId: Number(userId),
                ...rest,
            })
            if (error !== undefined) {
                throw error
            }
        },
        onMutate: resetStatus,
        onSuccess: async () => {
            setSuccess("Deposit successful")
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
            onSuccess={(data: FormData) => mutate(data)}
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
                    slotProps={{
                        htmlInput: { "data-dt-content": true },
                    }}
                />
                <NumberFormField
                    id="amount"
                    name="amount"
                    label="Amount"
                    type="number"
                    required
                    autoFocus
                    fullWidth
                    slotProps={{
                        htmlInput: { "data-dt-content": true },
                    }}
                />
                <TextFieldElement
                    id="cardholderName"
                    name="cardholderName"
                    label="Cardholder name"
                    required
                    fullWidth
                    slotProps={{
                        htmlInput: { "data-dt-content": true },
                    }}
                />
                <TextFieldElement
                    id="address"
                    name="address"
                    label="Address"
                    required
                    fullWidth
                    slotProps={{
                        htmlInput: { "data-dt-content": true },
                    }}
                />
                <TextFieldElement
                    id="email"
                    name="email"
                    label="Email"
                    required
                    fullWidth
                    slotProps={{
                        htmlInput: { "data-dt-content": true },
                    }}
                />
                <TextFieldElement
                    id="cardNumber"
                    name="cardNumber"
                    label="Card number"
                    required
                    fullWidth
                    slotProps={{
                        input: {
                            endAdornment: (
                                <InputAdornment position="end">
                                    <IconButton
                                        onClick={autofillCardNumber}
                                        edge="end"
                                    >
                                        <Edit />
                                    </IconButton>
                                </InputAdornment>
                            ),
                        },
                        htmlInput: { "data-dt-content": true },
                    }}
                />
                <SelectElement
                    id="cardType"
                    label="Card type"
                    name="cardType"
                    required
                    fullWidth
                    options={[
                        {
                            id: "visaDebit",
                            label: "Visa Debit",
                        },
                        {
                            id: "visaCredit",
                            label: "Visa Credit",
                        },
                        {
                            id: "mastercard",
                            label: "Mastercard",
                        },
                        {
                            id: "americanExpress",
                            label: "American Express",
                        },
                    ]}
                    sx={{
                        minWidth: "150px",
                    }}
                    slotProps={{
                        htmlInput: { "data-dt-content": true },
                    }}
                />
                <TextFieldElement
                    id="cvv"
                    name="cvv"
                    label="CVV"
                    required
                    fullWidth
                    slotProps={{
                        htmlInput: { "data-dt-content": true },
                    }}
                />
                <CheckboxElement
                    id="agreement"
                    name="agreementCheck"
                    label={
                        <CheckboxLabel
                            text="Agree to terms and conditions *"
                            hasErrors={
                                !!formContext.formState.errors.agreementCheck
                            }
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
                    <Button
                        type="button"
                        variant="outlined"
                        onClick={autofillForm}
                    >
                        Autofill
                    </Button>
                </CardActions>
                <StatusDisplay {...statusContext} />
            </Stack>
        </FormContainer>
    )
}
