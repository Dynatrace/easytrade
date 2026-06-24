import { delay } from "../../util"
import { BitcoinDepositRequest, BitcoinDepositResponse, BitcoinDepositHandler } from "./types"

async function handlerMock(
    data: BitcoinDepositRequest,
    error: boolean
): Promise<BitcoinDepositResponse> {
    console.log(`mock [depositBitcoin] API call with [${JSON.stringify(data)}]`)
    await delay(3000)
    if (error) {
        console.log("mock [depositBitcoin] API call returning with error")
        return { error: "There was an error processing the Bitcoin deposit" }
    }
    console.log("mock [depositBitcoin] API call returning with success")
    return {}
}

export function getBitcoinDepositHandlerMock({
    error = false,
}: { error?: boolean } = {}): BitcoinDepositHandler {
    return async (data: BitcoinDepositRequest) => await handlerMock(data, error)
}
