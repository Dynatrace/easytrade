import axios from "axios"
import { BitcoinDepositRequest, BitcoinDepositResponse } from "./types"
import { backends } from "../../backend"
import { BizEvents } from "../../bizEvents"

export async function depositBitcoin(
    requestData: BitcoinDepositRequest
): Promise<BitcoinDepositResponse> {
    console.log(`[depositBitcoin] API call with [${JSON.stringify(requestData)}]`)
    try {
        BizEvents.bitcoinDepositStart(requestData)
        await backends.creditCards.depositBitcoin(requestData)
        BizEvents.bitcoinDepositFinish()
        return {}
    } catch (error) {
        if (axios.isAxiosError(error)) {
            console.log("Axios error message: ", error.message)
        } else {
            console.log("Unexpected error: ", error)
        }
        const msg = "There was an error processing the Bitcoin deposit"
        BizEvents.bitcoinDepositError(msg)
        return { error: msg }
    }
}
