import { IPageActions, IVisit, randomBetween } from "@demoability/loadgen-core"
import { User } from "../user"
import { deposit, gotoDepositPage } from "../helpers/deposit"
import { login } from "../helpers/login"
import { logout } from "../helpers/logout"
import {
    getInstrumentPrice,
    getInstrumentName,
    getCurrentBalance,
    selectBuy,
    scheduleTransaction,
    gotoRandomInstrument,
} from "../helpers/instruments"
import { currencyFormatter, pageSetup } from "../helpers/common"
import { gotoCreditCardPage } from "../helpers/creditCard"
import { Logger } from "winston"
import { VisitName } from "./types"
import { Page } from "puppeteer"

type BuyOptions = {
    balance: number
    askPrice: number
    maxCost: number
}
type BuyResult = { price: number; amount: number }
type BuyCalculator = (options: BuyOptions) => BuyResult

export class DepositAndLongBuyVisit implements IVisit {
    readonly visitName: VisitName
    readonly buyCalculator: BuyCalculator
    readonly url: URL
    readonly user: User
    readonly depositValue: number
    readonly transactionDuration: number

    constructor(
        visitName: VisitName,
        buyCalculator: BuyCalculator,
        url: URL,
        user: User,
        depositValue: number,
        transactionDuration: number
    ) {
        this.visitName = visitName
        this.buyCalculator = buyCalculator
        this.url = url
        this.user = user
        this.depositValue = depositValue
        this.transactionDuration = transactionDuration
    }

    async setup(pageActions: IPageActions, logger: Logger): Promise<void> {
        logger.info(
            `Setting up page for user [${this.user.username}|${this.user.ip4}]`
        )
        await pageActions.setupPage(async (page: Page) => {
            await pageSetup(page, this.user, this.url)
        })
    }

    async run(pageActions: IPageActions, logger: Logger): Promise<void> {
        logger.info(`Going to EasyTrade frontend at [${this.url}]`)
        await pageActions.gotoPage(this.url.toString())

        logger.info(`Logging in as user [${this.user.username}]`)
        await login(pageActions, this.user)

        logger.info(
            `Depositing [${currencyFormatter.format(
                this.depositValue
            )}] for user [${this.user.username}]`
        )
        await gotoDepositPage(pageActions)
        await deposit(pageActions, this.user, this.depositValue)

        logger.info("Choosing which instrument to buy")
        await gotoRandomInstrument(pageActions)
        // this information is only available on quick-buy screen
        const currentBalance = await getCurrentBalance(pageActions)

        await selectBuy(pageActions)

        const instrumentPrice = await getInstrumentPrice(pageActions)
        const instrumentName = await getInstrumentName(pageActions)
        const { price, amount } = this.buyCalculator({
            balance: currentBalance,
            askPrice: instrumentPrice,
            maxCost: this.depositValue,
        })

        const purchaseDetails = this.getPurchaseDetails(
            currentBalance,
            instrumentName,
            price,
            amount,
            this.transactionDuration
        )
        logger.info(purchaseDetails)
        await scheduleTransaction(
            pageActions,
            price,
            this.transactionDuration,
            amount
        )

        logger.info(`Visiting the credit card page`)
        await gotoCreditCardPage(pageActions)

        logger.info(`Logging out user [${this.user.username}]`)
        await logout(pageActions)

        logger.info("Attempting to end dynatrace session")
        await pageActions.endDtSession()
    }

    getName(): string {
        return this.visitName
    }

    private getPurchaseDetails(
        currentBalance: number,
        instrumentName: string,
        price: number,
        amount: number,
        duration: number
    ): string {
        const totalPrice = price * amount
        return (
            `Scheduling transaction for [${duration}h] buying [${amount}] of ` +
            `asset [${instrumentName}] for [${currencyFormatter.format(
                price
            )}] ` +
            `each, total [${currencyFormatter.format(totalPrice)} | ` +
            `${currencyFormatter.format(currentBalance)}]`
        )
    }
}

/**
 * Calculates buy price | amount with the aim to create successful transaction
 * Returns price that is larger than currentPrice
 * Return amount as a number between 1 and maximum amount before exceeding preferredMaxCost
 *
 * @param currentBalance
 * @param currentPrice
 * @param preferredMaxCost
 * @returns
 */
export function successBuyCalculator({
    askPrice,
    maxCost,
}: BuyOptions): BuyResult {
    const price = askPrice * 1.1
    const amount = Math.floor(randomBetween(1, maxCost / price))
    return {
        price,
        amount,
    }
}

/**
 * Calculates buy price | amount with the aim to create timeout transaction
 * Returns price that is way smaller than currentPrice and should never be reached
 * causing timeout as the transaction will never begin processing
 * Return amount as a number between 1 and maximum amount before exceeding preferredMaxCost
 *
 * @param currentBalance
 * @param currentPrice
 * @param preferredMaxCost
 * @returns
 */
export function timeoutBuyCalculator({
    askPrice,
    maxCost,
}: BuyOptions): BuyResult {
    const price = askPrice * 0.01
    const amount = Math.floor(randomBetween(1, maxCost / price))
    return { price, amount }
}

/**
 * Calculates buy price | amount with the aim to create error transaction
 * Returns price that is some part of currentBalance or currentPrice, whichever is higher
 * causing the transaction to be processed
 * Return amount that should make the total price exceed currentBalance causing error
 * during processing
 *
 */
export function errorBuyCalculator({
    balance,
    askPrice,
}: BuyOptions): BuyResult {
    const proportion = 0.3
    const price = Math.max(balance, askPrice) * proportion
    const amount = Math.ceil(2 / proportion)
    return { price, amount }
}
