import { DepositRequest, WithdrawRequest } from "../api/backend/creditCard"
import { QuickTransactionRequest } from "../api/backend/transactions"

export class BizEvents {
    private static sendBizEvent(type: string, body: unknown): void {
        const dynatrace = window.dynatrace
        const dtrum = window.dtrum
        if (dynatrace === undefined) {
            console.log(
                `Dynatrace OneAgent not injected, bizevent [${type}] will not be send.`
            )
            return
        }
        try {
            console.log(`Sending bizevent [${type}]`)
            dynatrace.sendBizEvent(type, body)
        } catch (err) {
            console.error(`Error when sending bizevent [${type}]`, err)
            dtrum?.reportError(err)
        }
    }

    static depositStart(body: DepositRequest): void {
        this.sendBizEvent("com.easytrade.deposit.start", body)
    }

    static depositFinish(): void {
        this.sendBizEvent("com.easytrade.deposit.finish", {
            status: "finished",
        })
    }

    static depositError(message: string): void {
        this.sendBizEvent("com.easytrade.deposit.error", {
            status: "error",
            message,
        })
    }

    static withdrawStart(body: WithdrawRequest): void {
        this.sendBizEvent("com.easytrade.withdraw.start", body)
    }

    static withdrawFinish(): void {
        this.sendBizEvent("com.easytrade.withdraw.finish", {
            status: "finished",
        })
    }

    static withdrawError(message: string): void {
        this.sendBizEvent("com.easytrade.withdraw.error", {
            status: "error",
            message,
        })
    }

    static sellStart(body: QuickTransactionRequest): void {
        this.sendBizEvent("com.easytrade.sell.start", body)
    }

    static sellFinish(): void {
        this.sendBizEvent("com.easytrade.sell.finish", { status: "finished" })
    }

    static sellError(message: string): void {
        this.sendBizEvent("com.easytrade.sell.error", {
            status: "error",
            message,
        })
    }

    static buyStart(body: QuickTransactionRequest): void {
        this.sendBizEvent("com.easytrade.buy.start", body)
    }

    static buyFinish(): void {
        this.sendBizEvent("com.easytrade.buy.finish", { status: "finished" })
    }

    static buyError(message: string): void {
        this.sendBizEvent("com.easytrade.buy.error", {
            status: "error",
            message,
        })
    }
}
