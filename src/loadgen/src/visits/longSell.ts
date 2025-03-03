import { IPageActions, IVisit, randomBetween } from "@demoability/loadgen-core"

import { User } from "../user"

import { login } from "../helpers/login"
import { logout } from "../helpers/logout"
import {
    getInstrumentPrice,
    getInstrumentPossessedAmount,
    getInstrumentName,
    scheduleTransaction,
    selectSell,
    gotoRandomOwnedInstrument,
    selectQuickSell,
} from "../helpers/instruments"
import { currencyFormatter, pageSetup } from "../helpers/common"
import { gotoCreditCardPage } from "../helpers/creditCard"
import { Logger } from "winston"
import { VisitName } from "./types"
import { Page } from "puppeteer"

type SellOptions = {
    askPrice: number
    ownedAmount: number
    ratio: number
}
type SellResult = {
    price: number
    amount: number
}
type SellCalculator = (options: SellOptions) => SellResult

export class LongSellVisit implements IVisit {
    private visitName: VisitName
    private sellCalculator: SellCalculator
    readonly url: URL
    readonly user: User
    readonly sellRatio: number
    readonly transactionDuration: number

    getName(): string {
        return this.visitName
    }

    async setup(pageActions: IPageActions, logger: Logger): Promise<void> {
        logger.info(
            `Setting up page for user [${this.user.username}|${this.user.ip4}]`
        )
        await pageActions.setupPage(async (page: Page) => {
            await pageSetup(page, this.user, this.url)
        })
    }

    constructor(
        visitName: VisitName,
        sellCalculator: SellCalculator,
        url: URL,
        user: User,
        sellRatio: number,
        transactionDuration: number
    ) {
        this.visitName = visitName
        this.sellCalculator = sellCalculator
        this.url = url
        this.user = user
        this.sellRatio = sellRatio
        this.transactionDuration = transactionDuration
    }

    async run(pageActions: IPageActions, logger: Logger): Promise<void> {
        logger.info(`Going to EasyTrade frontend url [${this.url}]`)
        await pageActions.gotoPage(this.url.toString())

        logger.info(`Logging in as user [${this.user.username}]`)
        await login(pageActions, this.user)

        logger.info("Choosing which instrument to sell")
        await gotoRandomOwnedInstrument(pageActions)
        await selectQuickSell(pageActions)
        // this information is only available on quick-sell screen
        const instrumentAmount = await getInstrumentPossessedAmount(pageActions)

        await selectSell(pageActions)

        const instrumentPrice = await getInstrumentPrice(pageActions)
        const instrumentName = await getInstrumentName(pageActions)
        const { price, amount } = this.sellCalculator({
            askPrice: instrumentPrice,
            ownedAmount: instrumentAmount,
            ratio: this.sellRatio,
        })

        const sellDetails = this.getSellDetails(
            instrumentName,
            instrumentAmount,
            amount,
            price,
            this.transactionDuration
        )

        logger.info(sellDetails)

        await scheduleTransaction(
            pageActions,
            price,
            this.transactionDuration,
            amount
        )

        logger.info(`visiting the credit card page`)
        await gotoCreditCardPage(pageActions)

        logger.info(`logging out user [${this.user.username}]`)
        await logout(pageActions)

        logger.info("Attempting to end dynatrace session")
        await pageActions.endDtSession()
    }

    private getSellDetails(
        instrumentName: string,
        instrumentAmount: number,
        sellAmount: number,
        sellPrice: number,
        duration: number
    ): string {
        const totalPrice = sellAmount * sellPrice
        return (
            `Scheduling transaction for [${duration}h] selling [${sellAmount} | ` +
            `${instrumentAmount}] of asset [${instrumentName}] for ` +
            `[${currencyFormatter.format(sellPrice)}] each, total ` +
            `[${currencyFormatter.format(totalPrice)}]`
        )
    }
}

/**
 * Calculates sell price | amount with the aim to create successful transaction
 * Returns price as a fraction of current askPrice
 * Return amount as a number between 1 and some fraction of ownedAmount
 *
 */
export function successSellCalculator({
    askPrice,
    ownedAmount,
    ratio,
}: SellOptions): SellResult {
    return {
        price: askPrice * 0.9,
        amount: Math.floor(randomBetween(1, ownedAmount * ratio)),
    }
}

/**
 * Calculates sell price | amount with the aim to create timeout transaction
 * Returns price that is way bigger than current askPrice and should never be reached
 * causing timeout as the transaction will never begin processing
 * Returns amount as a number between 1 and some fraction of ownedAmount
 *
 */
export function timeoutSellCalculator({
    askPrice,
    ownedAmount,
    ratio,
}: SellOptions): SellResult {
    return {
        price: askPrice * 100,
        amount: Math.floor(randomBetween(1, ownedAmount * ratio)),
    }
}

/**
 * Calculates sell price | amount with the aim to create an error transaction
 * Returns price as a fraction of current askPrice
 * Returns amount that is bigger than possessed amount and should not be reached
 * before the transaction will be processed, triggering error due to insufficient assets
 *
 */
export function errorSellCalculator({
    askPrice,
    ownedAmount,
}: SellOptions): SellResult {
    return { price: askPrice * 0.9, amount: ownedAmount * 10 }
}
