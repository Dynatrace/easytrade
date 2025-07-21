import React from "react"
import { Button, CardActions, Stack } from "@mui/material"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { FormContainer, TextFieldElement } from "react-hook-form-mui"
import useStatusDisplay from "../../hooks/useStatusDisplay"
import StatusDisplay from "../StatusDisplay"
import { useMutation } from "@tanstack/react-query"
import { useEffect } from "react"
import { SignupHandler } from "../../api/signup/types"

const formSchema = z
    .object({
        firstName: z.string().min(1, "First name is required"),
        lastName: z.string().min(1, "Last name is required"),
        login: z.string().min(1, "Login is required"),
        email: z.email("Invalid email"),
        address: z.string().min(1, "Address is required"),
        password: z.string().min(1, "Password is required"),
        repeatPassword: z.string().min(1, "Password is required"),
    })
    .refine((data) => data.password === data.repeatPassword, {
        message: "Passwords have to match",
        path: ["repeatPassword"],
    })

type FormData = z.infer<typeof formSchema>

const defaultValues: FormData = {
    firstName: "",
    lastName: "",
    login: "",
    email: "",
    address: "",
    password: "",
    repeatPassword: "",
}

type SignupFormProps = {
    submitHandler: SignupHandler
}

export default function SignupForm({ submitHandler }: SignupFormProps) {
    const formContext = useForm<FormData>({
        defaultValues,
        resolver: zodResolver(formSchema),
    })
    const { reset, watch } = formContext
    const { setError, setSuccess, resetStatus, statusContext } =
        useStatusDisplay()

    const { mutate, isPending } = useMutation({
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        mutationFn: async ({ repeatPassword, ...data }: FormData) => {
            const { error } = await submitHandler(data)
            if (error !== undefined) {
                throw error
            }
        },
        onMutate: resetStatus,
        onSuccess: () => {
            setSuccess("User created successfully. You may now login.")
            reset()
        },
        onError: setError,
    })

    useEffect(() => {
        const { unsubscribe } = watch((_data, { type }) => {
            if (type === "change") {
                resetStatus()
            }
        })
        return unsubscribe
    }, [watch])

    return (
        <FormContainer
            onSuccess={(data: FormData) => mutate(data)}
            formContext={formContext}
        >
            <Stack direction={"column"} spacing={2}>
                <TextFieldElement
                    name="firstName"
                    label="First name"
                    fullWidth
                />
                <TextFieldElement name="lastName" label="Last name" fullWidth />
                <TextFieldElement name="login" label="Login" fullWidth />
                <TextFieldElement name="email" label="Email" fullWidth />
                <TextFieldElement name="address" label="Address" fullWidth />
                <TextFieldElement
                    name="password"
                    label="Password"
                    type="password"
                    fullWidth
                />
                <TextFieldElement
                    name="repeatPassword"
                    label="Repeat password"
                    type="password"
                    fullWidth
                />
                <CardActions sx={{ justifyContent: "center" }}>
                    <Button
                        loading={isPending}
                        type="submit"
                        variant="outlined"
                    >
                        Sign up
                    </Button>
                </CardActions>
                <StatusDisplay {...statusContext} />
            </Stack>
        </FormContainer>
    )
}
