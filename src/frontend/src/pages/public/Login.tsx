import React from "react"
import { Link, useLoaderData } from "react-router"
import { PresetUser } from "../../api/user/types"
import DefaultLoginForm from "../../components/forms/DefaultLoginForm"
import LoginForm from "../../components/forms/LoginForm"
import { useAuth } from "../../contexts/AuthContext/context"
import { usePresetUsersQuery } from "../../contexts/QueryContext/user/hooks"

export default function Login() {
    const { loginHandler, defaultLoginHandler } = useAuth()
    const initialData: PresetUser[] = useLoaderData()
    const { data } = usePresetUsersQuery(initialData)

    return (
        <div className="login-layout">
            {/* Left column — used by loadgen */}
            <div className="login-panel">
                <h2>Sign in</h2>
                <LoginForm submitHandler={loginHandler} />
                <p style={{ marginTop: "var(--space-4)", fontSize: "var(--text-sm)" }}>
                    <Link to="/signup">Don&apos;t have an account? Sign up</Link>
                </p>
            </div>

            {/* Right column — preset user quick-select */}
            <div className="login-panel">
                <h2>Quick login</h2>
                <DefaultLoginForm
                    users={data ?? []}
                    submitHandler={({ userId }) => defaultLoginHandler(userId)}
                />
            </div>
        </div>
    )
}
