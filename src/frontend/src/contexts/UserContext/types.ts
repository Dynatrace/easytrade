import { LogoutHandler } from "../AuthContext/types"

export type IUserContext = {
    userId: string
    logoutHandler: LogoutHandler
}
export type ProviderProps = {
    userId: string | null
    logoutHandler: LogoutHandler
}
