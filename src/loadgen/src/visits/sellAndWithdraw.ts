import { IPageActions, IVisit, randomBetween } from "@demoability/loadgen-core"
import { User } from "../user"

import { login } from "../helpers/login"
import { logout } from "../helpers/logout"
import { gotoWithdrawPage, withdraw } from "../helpers/withdraw"
import {
    getInstrumentName,
    getInstrumentPossessedAmount,
    getInstrumentPrice,
    gotoRandomOwnedInstrument,
    selectQuickSell,
    trade,
} from "../helpers/instruments"
import { currencyFormatter, pageSetup } from "../helpers/common"
import { gotoCreditCardPage } from "../helpers/creditCard"
import { Logger } from "winston"
import { VisitName } from "./types"
import { Page } from "puppeteer"

export class SellAndWithdrawVisit implements IVisit {
    readonly visitName: VisitName
    readonly url: URL
    readonly user: User
    readonly sellRatio: number
    readonly withdrawMinValue: number

    constructor(
        visitName: VisitName,
        url: URL,
        user: User,
        sellRatio: number,
        withdrawMinValue: number
    ) {
        this.visitName = visitName
        this.url = url
        this.user = user
        this.sellRatio = sellRatio
        this.withdrawMinValue = withdrawMinValue
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
        logger.info(`Going to EasyTrade frontend url [${this.url}]`)
        await pageActions.gotoPage(this.url.toString())
        logger.info(`logging in as user [${this.user.username}]`)
        await login(pageActions, this.user)

        await gotoRandomOwnedInstrument(pageActions)
        await selectQuickSell(pageActions)

        const instrumentAmount = await getInstrumentPossessedAmount(pageActions)
        const instrumentPrice = await getInstrumentPrice(pageActions)
        const instrumentName = await getInstrumentName(pageActions)
        const sellAmount = Math.floor(
            randomBetween(1, instrumentAmount * this.sellRatio)
        )

        const sellDetails = this.getSellDetails(
            sellAmount,
            instrumentAmount,
            instrumentPrice,
            instrumentName
        )

        logger.info(sellDetails)

        await trade(pageActions, sellAmount)

        const withdrawAmount = Math.max(
            this.withdrawMinValue,
            instrumentPrice * sellAmount
        )
        await gotoWithdrawPage(pageActions)
        logger.info(`withdrawing [${withdrawAmount}$]`)
        await withdraw(pageActions, this.user, withdrawAmount)

        logger.info(`visiting the credit card page`)
        await gotoCreditCardPage(pageActions)

        logger.info(`logging out user [${this.user.username}]`)
        await logout(pageActions)

        await pageActions.endDtSession()
    }

    getName(): string {
        return this.visitName
    }

    private getSellDetails(
        sellAmount: number,
        instrumentAmount: number,
        instrumentPrice: number,
        instrumentName: string
    ): string {
        const totalPrice = sellAmount * instrumentPrice

        return (
            `Selling [${sellAmount} | ${instrumentAmount}] of asset [${instrumentName}] ` +
            `for [${currencyFormatter.format(instrumentPrice)}] each, total ` +
            `[${currencyFormatter.format(totalPrice)}]`
        )
    }
}
