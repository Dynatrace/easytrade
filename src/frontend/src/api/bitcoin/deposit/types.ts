import { BitcoinDepositRequest } from "../../backend/creditCard"

export type { BitcoinDepositRequest }
export type BitcoinDepositResponse = {
    error?: string
}
export type BitcoinDepositHandler = (
    requestData: BitcoinDepositRequest
) => Promise<BitcoinDepositResponse>
