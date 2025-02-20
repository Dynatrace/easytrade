import { WithdrawRequest } from "../../backend/creditCard"

export type { WithdrawRequest }
export type WithdrawResponse = {
    error?: string
}
export type WithdrawHandler = (
    requestData: WithdrawRequest
) => Promise<WithdrawResponse>
