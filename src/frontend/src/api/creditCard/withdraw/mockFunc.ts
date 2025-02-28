import { delay } from "../../util"
import { WithdrawHandler, WithdrawRequest, WithdrawResponse } from "./types"

async function handlerMock(
    data: WithdrawRequest,
    error: boolean
): Promise<WithdrawResponse> {
    console.log(`mock [withdraw] API call with [${JSON.stringify(data)}]`)
    await delay(3000)
    if (error) {
        console.log("mock [withdraw] API call returning with error")
        return { error: "There was an error processing the deposit" }
    }
    console.log("mock [withdraw] API call returning with success")
    return {}
}

export function getWithdrawHandlerMock({
    error = false,
}: { error?: boolean } = {}): WithdrawHandler {
    return async (data: WithdrawRequest) => await handlerMock(data, error)
}
