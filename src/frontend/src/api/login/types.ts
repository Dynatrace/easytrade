import { LoginResponse, LogoutResponse } from "../backend/users"

export type { LoginResponse, LogoutResponse }

export type LoginHandler = (
    login: string,
    password: string
) => Promise<LoginResponse>

export type LogoutHandler = (userId: string) => Promise<LogoutResponse>
