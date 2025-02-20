import { LogoutHandler } from "../../api/login/types"

export type IUserContext = {
    userId: string
    logoutHandler: LogoutHandler
}
export type ProviderProps = {
    userId: string | null
    logoutHandler: LogoutHandler
}
