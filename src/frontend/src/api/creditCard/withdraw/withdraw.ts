import { WithdrawRequest, WithdrawResponse } from "./types"
import { backends } from "../../backend"
import { BizEvents } from "../../bizEvents"

export async function withdraw(
    requestData: WithdrawRequest
): Promise<WithdrawResponse> {
    console.log(`[withdraw] API call with [${JSON.stringify(requestData)}]`)

    try {
        BizEvents.withdrawStart(requestData)
        await backends.creditCards.withdraw(requestData)
        BizEvents.withdrawFinish()
        return {}
    } catch (error) {
        console.log("error: ", error)
        const msg = "There was an error processing the withdraw"
        BizEvents.withdrawError(msg)
        return { error: msg }
    }
}
