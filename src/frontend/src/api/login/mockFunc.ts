import { USERS } from "../user/mockData"
import { delay } from "../util"
import { LoginResponse } from "./types"

export async function loginMock(
    login: string,
    password: string
): Promise<LoginResponse> {
    console.log(
        `mock [login] API call with [${JSON.stringify({ login, password })}]`
    )
    await delay(2000)
    const user = USERS.find(
        (user) => user.username === login && user.password === password
    )
    return user
        ? { id: user.id.toString() }
        : { error: "Login or password invalid" }
}

// eslint-disable-next-line @typescript-eslint/require-await
export async function logout() {
    console.log("mock [logout] API call")
}
