import React, { useState } from "react"
import useStatusDisplay from "../../hooks/useStatusDisplay"
import StatusDisplay from "../StatusDisplay"
import { useMutation } from "@tanstack/react-query"
import { SignupHandler } from "../../api/signup/types"

type SignupFormProps = {
    submitHandler: SignupHandler
}

type FormState = {
    firstName: string
    lastName: string
    login: string
    email: string
    address: string
    password: string
    repeatPassword: string
}

const empty: FormState = {
    firstName: "",
    lastName: "",
    login: "",
    email: "",
    address: "",
    password: "",
    repeatPassword: "",
}

export default function SignupForm({ submitHandler }: SignupFormProps) {
    const [form, setForm] = useState<FormState>(empty)
    const { setError, setSuccess, resetStatus, statusContext } =
        useStatusDisplay()

    function set(field: keyof FormState) {
        return (e: React.ChangeEvent<HTMLInputElement>) => {
            setForm((prev) => ({ ...prev, [field]: e.target.value }))
            resetStatus()
        }
    }

    const { mutate, isPending } = useMutation({
        mutationFn: async () => {
            if (form.password !== form.repeatPassword) {
                throw "Passwords have to match"
            }
            if (
                !form.firstName ||
                !form.lastName ||
                !form.login ||
                !form.email ||
                !form.address ||
                !form.password
            ) {
                throw "All fields are required"
            }
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const { repeatPassword, ...data } = form
            const { error } = await submitHandler(data)
            if (error !== undefined) {
                throw error
            }
        },
        onMutate: resetStatus,
        onSuccess: () => {
            setSuccess("User created successfully. You may now login.")
            setForm(empty)
        },
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        onError: (e: any) =>
            setError(typeof e === "string" ? e : (e?.message ?? String(e))),
    })

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault()
        mutate()
    }

    const fields: { key: keyof FormState; label: string; type?: string }[] = [
        { key: "firstName", label: "First name" },
        { key: "lastName", label: "Last name" },
        { key: "login", label: "Login" },
        { key: "email", label: "Email", type: "email" },
        { key: "address", label: "Address" },
        { key: "password", label: "Password", type: "password" },
        { key: "repeatPassword", label: "Repeat password", type: "password" },
    ]

    return (
        <form className="form" onSubmit={handleSubmit}>
            {fields.map(({ key, label, type = "text" }) => (
                <div className="form-group" key={key}>
                    <label className="form-label" htmlFor={key}>
                        {label}
                    </label>
                    <input
                        id={key}
                        type={type}
                        value={form[key]}
                        onChange={set(key)}
                        required
                    />
                </div>
            ))}
            <div className="form-actions">
                <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={isPending}
                >
                    {isPending ? <span className="spinner" /> : null}
                    Sign up
                </button>
            </div>
            <StatusDisplay {...statusContext} />
        </form>
    )
}
