import { LoginResponse } from "./types"
import { backends } from "../backend"

export async function login(
    login: string,
    password: string
): Promise<LoginResponse> {
    console.log(
        `[login] API call with [${JSON.stringify({ login, password })}]`
    )
    try {
        return await backends.users.login(login, password)
    } catch (error) {
        console.error("error: ", error)
        return { error: "Login or password invalid" }
    }
}
