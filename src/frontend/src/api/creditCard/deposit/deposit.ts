import { DepositRequest, DepositResponse } from "./types"
import { backends } from "../../backend"
import { BizEvents } from "../../bizEvents"

export async function deposit(
    requestData: DepositRequest
): Promise<DepositResponse> {
    console.log(`[deposit] API call with [${JSON.stringify(requestData)}]`)
    try {
        BizEvents.depositStart(requestData)
        await backends.creditCards.deposit(requestData)
        BizEvents.depositFinish()
        return {}
    } catch (error) {
        console.log("error: ", error)
        const msg = "There was an error processing the deposit"
        BizEvents.depositError(msg)
        return { error: msg }
    }
}
