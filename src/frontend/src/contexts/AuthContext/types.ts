import { Dispatch, SetStateAction } from "react"
import { LoginHandler } from "../../api/login/types"

type DefaultLoginHandler = (userId: string) => void

// Logout has no backend call to make (there's no server-side session to invalidate),
// so it's a synchronous, local-only state clear rather than an injectable API handler.
type LogoutHandler = () => void

type SetValue<T> = Dispatch<SetStateAction<T>>
type RemoveValue = () => void
type StoreHandler = (
    value: string | null
) => [string | null, SetValue<string | null>, RemoveValue?]

type AuthProviderProps = {
    loginHandler: LoginHandler
    initialId?: string
    storeHandler?: StoreHandler
}

type IAuthContext = {
    userId: string | null
    isLoggedIn: boolean
    loginHandler: LoginHandler
    logoutHandler: LogoutHandler
    defaultLoginHandler: DefaultLoginHandler
}

export type { IAuthContext, AuthProviderProps, LogoutHandler }
