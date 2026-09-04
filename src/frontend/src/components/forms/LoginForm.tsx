import { useToast } from "../../contexts/ToastContext/context"
import React, { useState } from "react"
import { LoginHandler } from "../../api/login/types"

import { useMutation } from "@tanstack/react-query"


type LoginFormProps = {
    submitHandler: LoginHandler
}

export default function LoginForm({ submitHandler }: LoginFormProps) {
    const [login, setLogin] = useState("")
    const [password, setPassword] = useState("")
    const [loginError, setLoginError] = useState("")
    const [passwordError, setPasswordError] = useState("")
    const { showToast } = useToast()

    const { mutate, isPending } = useMutation({
        mutationFn: async () => {
            let valid = true
            if (!login) { setLoginError("Login is required"); valid = false } else setLoginError("")
            if (!password) { setPasswordError("Password is required"); valid = false } else setPasswordError("")
            if (!valid) throw "Validation failed"
            const { error } = await submitHandler(login, password)
            if (error !== undefined) throw error
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

    return (
        <form className="form" onSubmit={handleSubmit}>
            <div className="form-group">
                <label className="form-label" htmlFor="login">
                    Login
                </label>
                <input
                    id="login"
                    type="text"
                    value={login}
                    onChange={(e) => {
                        setLogin(e.target.value)
                        setLoginError("")
                    }}
                    autoComplete="username"
                />
                {loginError && <span className="field-error">{loginError}</span>}
            </div>
            <div className="form-group">
                <label className="form-label" htmlFor="password">
                    Password
                </label>
                <input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => {
                        setPassword(e.target.value)
                        setPasswordError("")
                    }}
                    autoComplete="current-password"
                />
                {passwordError && <span className="field-error">{passwordError}</span>}
            </div>
            <div className="form-actions">
                <button
                    id="submitButton"
                    type="submit"
                    className="btn btn-primary"
                    disabled={isPending}
                >
                    {isPending ? <span className="spinner" /> : null}
                    Login
                </button>
            </div>
        </form>
    )
}
