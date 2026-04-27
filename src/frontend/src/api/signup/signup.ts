import { SignupRequest, SignupResponse } from "./types"
import { backends } from "../backend"
import { XMLBuilder, XMLParser } from "fast-xml-parser"

export async function signup(request: SignupRequest): Promise<SignupResponse> {
    console.log(`[signup] API call with [${JSON.stringify(request)}]`)

    try {
        const data = await backends.users.signupXml(
            new XMLBuilder(),
            new XMLParser(),
            {
                packageId: 1,
                origin: "easyTrade",
                firstName: request.firstName,
                lastName: request.lastName,
                username: request.login,
                email: request.email,
                address: request.address,
                password: request.password,
            }
        )
        return data.IdResponse
    } catch (error) {
        console.error("error: ", error)
        return {
            error: "There was an error processing the signup request.",
        }
    }
}
