import React, { useState } from "react"
import { LoginHandler } from "../../api/login/types"
import useStatusDisplay from "../../hooks/useStatusDisplay"
import { useMutation } from "@tanstack/react-query"
import StatusDisplay from "../StatusDisplay"

type LoginFormProps = {
    submitHandler: LoginHandler
}

export default function LoginForm({ submitHandler }: LoginFormProps) {
    const [login, setLogin] = useState("")
    const [password, setPassword] = useState("")
    const [loginError, setLoginError] = useState("")
    const [passwordError, setPasswordError] = useState("")
    const { setError, resetStatus, statusContext } = useStatusDisplay()

    const { mutate, isPending } = useMutation({
        mutationFn: async () => {
            let valid = true
            if (!login) { setLoginError("Login is required"); valid = false } else setLoginError("")
            if (!password) { setPasswordError("Password is required"); valid = false } else setPasswordError("")
            if (!valid) throw "Validation failed"
            const { error } = await submitHandler(login, password)
            if (error !== undefined) throw error
        },
        onMutate: resetStatus,
        onError: (e: unknown) => {
            if (e === "Validation failed") return
            setError(typeof e === "string" ? e : ((e instanceof Error) ? e.message : String(e)))
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
                        resetStatus()
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
                        resetStatus()
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
            <StatusDisplay {...statusContext} />
        </form>
    )
}
