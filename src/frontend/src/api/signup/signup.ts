import { SignupRequest, SignupResponse } from "./types"
import { backends } from "../backend"

export async function signup(request: SignupRequest): Promise<SignupResponse> {
    console.log(`[signup] API call with [${JSON.stringify(request)}]`)

    try {
        return await backends.users.signup({
            packageId: 1,
            origin: "easyTrade",
            firstName: request.firstName,
            lastName: request.lastName,
            username: request.login,
            email: request.email,
            address: request.address,
            password: request.password,
        })
    } catch (error) {
        console.error("error: ", error)
        return {
            error: "There was an error processing the signup request.",
        }
    }
}
