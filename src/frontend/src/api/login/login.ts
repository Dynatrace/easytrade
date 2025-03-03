import axios from "axios"
import { LoginResponse, LogoutResponse } from "./types"
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
        if (axios.isAxiosError(error)) {
            console.error("Axios error message: ", error.message)
        } else {
            console.error("Unexpected error: ", error)
        }
        return { error: "Login or password invalid" }
    }
}

export async function logout(userId: string): Promise<LogoutResponse> {
    console.log("[logout] API call")
    try {
        const data = await backends.users.logoutXml(
            new XMLBuilder(),
            new XMLParser(),
            Number(userId)
        )
        return data.MessageResponse
    } catch (error) {
        if (axios.isAxiosError(error)) {
            console.error("Axios error message: ", error.message)
        } else {
            console.error("Unexpected error: ", error)
        }
        return {
            error: "There was a problem with logging out",
        }
    }
}
