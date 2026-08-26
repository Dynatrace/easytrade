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
    const { setError, resetStatus, statusContext } = useStatusDisplay()

    const { mutate, isPending } = useMutation({
        mutationFn: async () => {
            if (!login || !password) {
                throw "Login and password are required"
            }
            const { error } = await submitHandler(login, password)
            if (error !== undefined) {
                throw error
            }
        },
        onMutate: resetStatus,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any -- onError receives unknown shape from throw
        onError: (e: any) => setError(typeof e === "string" ? e : (e?.message ?? String(e))),
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
                        resetStatus()
                    }}
                    autoComplete="username"
                    required
                />
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
                        resetStatus()
                    }}
                    autoComplete="current-password"
                    required
                />
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
