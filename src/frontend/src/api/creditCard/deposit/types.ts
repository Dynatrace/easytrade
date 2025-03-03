import { DepositRequest } from "../../backend/creditCard"

export type { DepositRequest }
export type DepositResponse = {
    error?: string
}
export type DepositHandler = (
    requestData: DepositRequest
) => Promise<DepositResponse>
