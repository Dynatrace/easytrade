import React from "react"
import { createContext, PropsWithChildren, useContext } from "react"
import { sessionStore } from "./storage"
import { AuthProviderProps, IAuthContext } from "./types"

const AuthContext = createContext<IAuthContext | null>(null)

export function AuthProvider({
    loginHandler,
    initialId,
    children,
    storeHandler = sessionStore,
}: PropsWithChildren<AuthProviderProps>) {
    const [userId, setUserId] = storeHandler(initialId ?? null)

    async function login(login: string, password: string) {
        const { id, error } = await loginHandler(login, password)
        if (id !== undefined) {
            setUserId(id)
        }
        return { id, error }
    }

    function logout() {
        setUserId(null)
    }

    function defaultLogin(userId: string) {
        setUserId(userId)
    }

    return (
        <AuthContext.Provider
            value={{
                userId,
                isLoggedIn: userId !== null,
                loginHandler: login,
                logoutHandler: logout,
                defaultLoginHandler: defaultLogin,
            }}
        >
            {children}
        </AuthContext.Provider>
    )
}

export function useAuth() {
    const context = useContext(AuthContext)
    if (context === null) {
        throw new Error(
            "Components using [useAuth] hook need to be wrapped in [AuthProvider]"
        )
    }
    return context
}
