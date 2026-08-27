import { useToast } from "../../contexts/ToastContext/context"
import React, { useState } from "react"


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

type FieldErrors = Partial<Record<keyof FormState, string>>

const empty: FormState = {
    firstName: "",
    lastName: "",
    login: "",
    email: "",
    address: "",
    password: "",
    repeatPassword: "",
}

function validateEmail(email: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

export default function SignupForm({ submitHandler }: SignupFormProps) {
    const [form, setForm] = useState<FormState>(empty)
    const [fieldErrors, setFieldErrors] = useState<FieldErrors>({})
    const { showToast } = useToast()

    function set(field: keyof FormState) {
        return (e: React.ChangeEvent<HTMLInputElement>) => {
            setForm((prev) => ({ ...prev, [field]: e.target.value }))
            setFieldErrors((prev) => ({ ...prev, [field]: undefined }))
        }
    }

    function validate(): boolean {
        const errors: FieldErrors = {}
        if (!form.firstName) errors.firstName = "First name is required"
        if (!form.lastName) errors.lastName = "Last name is required"
        if (!form.login) errors.login = "Login is required"
        if (!form.email) {
            errors.email = "Email is required"
        } else if (!validateEmail(form.email)) {
            errors.email = "Invalid email"
        }
        if (!form.address) errors.address = "Address is required"
        if (!form.password) errors.password = "Password is required"
        if (form.password && form.repeatPassword && form.password !== form.repeatPassword) {
            errors.repeatPassword = "Passwords have to match"
        }
        setFieldErrors(errors)
        return Object.keys(errors).length === 0
    }

    const { mutate, isPending } = useMutation({
        mutationFn: async () => {
            if (!validate()) throw "Validation failed"
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const { repeatPassword, ...data } = form
            const { error } = await submitHandler(data)
            if (error !== undefined) throw error
        },
        onSuccess: () => {
            showToast("User created successfully. You may now login.", "success")
            setForm(empty)
            setFieldErrors({})
        },
        onError: (e: unknown) => {
            if (e === "Validation failed") return
            showToast(typeof e === "string" ? e : ((e instanceof Error) ? e.message : String(e)), "error")
        },
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
        <form className="form" onSubmit={handleSubmit} noValidate>
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
                    />
                    {fieldErrors[key] && (
                        <span className="field-error">{fieldErrors[key]}</span>
                    )}
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
        </form>
    )
}
