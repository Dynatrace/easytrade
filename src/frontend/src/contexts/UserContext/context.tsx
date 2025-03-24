import React from "react"
import { createContext, PropsWithChildren, useContext } from "react"
import { IUserContext, ProviderProps } from "./types"

const UserContext = createContext<IUserContext | undefined>(undefined)

export function UserContextProvider({
    userId,
    logoutHandler,
    children,
}: PropsWithChildren<ProviderProps>) {
    if (userId === null) {
        throw new Error(`Need authenticated user to use [UserContextProvider]`)
    }
    return (
        <UserContext.Provider
            value={{
                userId,
                logoutHandler,
            }}
        >
            {children}
        </UserContext.Provider>
    )
}

export function useAuthUser() {
    const context = useContext(UserContext)
    if (context === undefined) {
        throw new Error(
            `[useAuthUser] hook needs to be wrapped in [UserContextProvider]`
        )
    }
    return context
}
