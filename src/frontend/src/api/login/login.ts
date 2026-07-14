import { LoginResponse } from "./types"
import { backends } from "../backend"
import { XMLBuilder, XMLParser } from "fast-xml-parser"

export async function login(
    login: string,
    password: string
): Promise<LoginResponse> {
    console.log(
        `[login] API call with [${JSON.stringify({ login, password })}]`
    )
    try {
        const data = await backends.users.loginXml(
            new XMLBuilder(),
            new XMLParser(),
            login,
            password
        )
        return data.IdResponse
    } catch (error) {
        console.error("error: ", error)
        return { error: "Login or password invalid" }
    }
}
