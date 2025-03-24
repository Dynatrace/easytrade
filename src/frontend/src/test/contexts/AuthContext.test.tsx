import React from "react"
import "@testing-library/jest-dom"
import { render, screen } from "@testing-library/react"
import { AuthProvider, useAuth, localStore } from "../../contexts/AuthContext"
import userEvent from "@testing-library/user-event"

function ContextTestComponent() {
    const {
        userId,
        loginHandler,
        logoutHandler,
        defaultLoginHandler,
        isLoggedIn,
    } = useAuth()
    return (
        <>
            <button onClick={() => void loginHandler("", "")}>login</button>
            <button onClick={() => void logoutHandler(`${userId}`)}>
                logout
            </button>
            <button onClick={() => defaultLoginHandler("1")}>
                login as [1]
            </button>
            {isLoggedIn ? (
                <p>user is set to [{userId}]</p>
            ) : (
                <p>user is null</p>
            )}
        </>
    )
}

test("context provides null when user not logged in", () => {
    render(
        <AuthProvider
            loginHandler={vi.fn()}
            logoutHandler={vi.fn()}
            storeHandler={localStore}
        >
            <ContextTestComponent />
        </AuthProvider>
    )
    expect(screen.getByText(/user is null/i)).toBeInTheDocument()
})

test("context provides user id when user logged in", () => {
    render(
        <AuthProvider
            loginHandler={vi.fn()}
            logoutHandler={vi.fn()}
            initialId={"1"}
            storeHandler={localStore}
        >
            <ContextTestComponent />
        </AuthProvider>
    )
    expect(screen.getByText(/user is set/i)).toBeInTheDocument()
})

test("sets user id when user successfully logs in", async () => {
    const user = userEvent.setup()
    render(
        <AuthProvider
            loginHandler={vi.fn(() => Promise.resolve({ id: "1" }))}
            logoutHandler={vi.fn()}
            storeHandler={localStore}
        >
            <ContextTestComponent />
        </AuthProvider>
    )
    await user.click(screen.getByRole("button", { name: /login$/i }))

    expect(screen.getByText(/user is set to \[1\]/i)).toBeInTheDocument()
})

test("sets user id to null when user fails to log in", async () => {
    const user = userEvent.setup()
    render(
        <AuthProvider
            loginHandler={vi.fn(() => Promise.resolve({ error: "error" }))}
            logoutHandler={vi.fn()}
            storeHandler={localStore}
        >
            <ContextTestComponent />
        </AuthProvider>
    )
    await user.click(screen.getByRole("button", { name: /login$/i }))

    expect(screen.getByText(/user is null/i)).toBeInTheDocument()
})

test("sets user id to null when user logs out", async () => {
    const user = userEvent.setup()
    render(
        <AuthProvider
            loginHandler={vi.fn()}
            logoutHandler={vi.fn(() =>
                Promise.resolve({
                    message: "logged out",
                })
            )}
            initialId={"1"}
            storeHandler={localStore}
        >
            <ContextTestComponent />
        </AuthProvider>
    )
    await user.click(screen.getByRole("button", { name: /logout/i }))

    expect(screen.getByText(/user is null/i)).toBeInTheDocument()
})

test("default login sets user id", async () => {
    const user = userEvent.setup()
    render(
        <AuthProvider
            loginHandler={vi.fn()}
            logoutHandler={vi.fn()}
            storeHandler={localStore}
        >
            <ContextTestComponent />
        </AuthProvider>
    )
    await user.click(screen.getByRole("button", { name: /login as \[1\]/i }))

    expect(screen.getByText(/user is set to \[1\]/i)).toBeInTheDocument()
})
