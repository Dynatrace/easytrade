import { LoginResponse } from "../backend/users"

export type { LoginResponse }

export type LoginHandler = (
    login: string,
    password: string
) => Promise<LoginResponse>
