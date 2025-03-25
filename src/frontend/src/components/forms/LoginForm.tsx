import React from "react"
import { Button, CardActions } from "@mui/material"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { FormContainer, TextFieldElement } from "react-hook-form-mui"
import { useEffect } from "react"
import { LoginHandler } from "../../api/login/types"
import useStatusDisplay from "../../hooks/useStatusDisplay"
import { useMutation } from "@tanstack/react-query"
import StatusDisplay from "../StatusDisplay"
import { Stack } from "@mui/system"

const formSchema = z.object({
    login: z.string().min(1, "Login is required"),
    password: z.string().min(1, "Password is required"),
})

type FormData = z.infer<typeof formSchema>

const defaultValues: FormData = {
    login: "",
    password: "",
}

type LoginFormProps = {
    submitHandler: LoginHandler
}

export default function LoginForm({ submitHandler }: LoginFormProps) {
    const formContext = useForm<FormData>({
        defaultValues,
        resolver: zodResolver(formSchema),
    })
    const { watch } = formContext
    const { setError, resetStatus, statusContext } = useStatusDisplay()

    const { mutate, isPending } = useMutation({
        mutationFn: async ({ login, password }: FormData) => {
            const { error } = await submitHandler(login, password)
            if (error !== undefined) {
                throw error
            }
        },
        onMutate: resetStatus,
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
                <TextFieldElement id="login" name="login" label="Login" />
                <TextFieldElement
                    id="password"
                    name="password"
                    label="Password"
                    type="password"
                />
                <CardActions sx={{ justifyContent: "center" }}>
                    <Button
                        id="submitButton"
                        loading={isPending}
                        type="submit"
                        variant="outlined"
                    >
                        Login
                    </Button>
                </CardActions>
                <StatusDisplay {...statusContext} />
            </Stack>
        </FormContainer>
    )
}
