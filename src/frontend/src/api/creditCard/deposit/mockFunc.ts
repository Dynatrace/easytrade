import { delay } from "../../util"
import { DepositRequest, DepositResponse, DepositHandler } from "./types"

async function handlerMock(
    data: DepositRequest,
    error: boolean
): Promise<DepositResponse> {
    console.log(`mock [deposit] API call with [${JSON.stringify(data)}]`)
    await delay(3000)
    if (error) {
        console.log("mock [deposit] API call returning with error")
        return { error: "There was an error processing the deposit" }
    }
    console.log("mock [deposit] API call returning with success")
    return {}
}

export function getDepositHandlerMock({
    error = false,
}: { error?: boolean } = {}): DepositHandler {
    return async (data: DepositRequest) => await handlerMock(data, error)
}
