import { Dispatch, SetStateAction } from "react"
import { LoginHandler, LogoutHandler } from "../../api/login/types"

type DefaultLoginHandler = (userId: string) => void

type SetValue<T> = Dispatch<SetStateAction<T>>
type RemoveValue = () => void
type StoreHandler = (
    value: string | null
) => [string | null, SetValue<string | null>, RemoveValue?]

type AuthProviderProps = {
    loginHandler: LoginHandler
    logoutHandler: LogoutHandler
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

export type { IAuthContext, AuthProviderProps }
