import { delay } from "../util"
import { SignupRequest, SignupResponse } from "./types"

export async function signupMock(data: SignupRequest): Promise<SignupResponse> {
    console.log(`mock [signup] API call with [${JSON.stringify(data)}]`)
    await delay(3000)
    console.log("mock [signup] API call returning with success")
    return {}
}
