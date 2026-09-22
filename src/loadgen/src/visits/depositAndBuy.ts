import { IPageActions, IVisit, randomBetween } from "@demoability/loadgen-core"

import { User } from "../user"

import { deposit, gotoDepositPage } from "../helpers/deposit"
import { login } from "../helpers/login"
import { logout } from "../helpers/logout"
import {
    getCurrentBalance,
    getInstrumentName,
    getInstrumentPrice,
    gotoRandomInstrument,
    selectQuickBuy,
    trade,
} from "../helpers/instruments"
import { currencyFormatter, pageSetup } from "../helpers/common"
import { gotoCreditCardPage } from "../helpers/creditCard"
import { Logger } from "winston"
import { VisitName } from "./types"
import { Page } from "puppeteer"

export class DepositAndBuyVisit implements IVisit {
    readonly visitName: VisitName
    readonly url: URL
    readonly user: User
    readonly depositValue: number

    constructor(
        visitName: VisitName,
        url: URL,
        user: User,
        depositValue: number
    ) {
        this.visitName = visitName
        this.url = url
        this.user = user
        this.depositValue = depositValue
    }

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
        await selectQuickBuy(pageActions)
        const instrumentPrice = await getInstrumentPrice(pageActions)
        const currentBalance = await getCurrentBalance(pageActions)
        const instrumentName = await getInstrumentName(pageActions)
        const buyAmount = Math.floor(
            randomBetween(1, this.depositValue / instrumentPrice)
        )
        const purchaseDetails = this.getPurchaseDetails(
            buyAmount,
            instrumentPrice,
            currentBalance,
            instrumentName
        )
        logger.info(purchaseDetails)
        await trade(pageActions, buyAmount)

        logger.info("Visiting the credit card page")
        await gotoCreditCardPage(pageActions)

        logger.info(`Logging out user [${this.user.username}]`)
        await logout(pageActions)

        logger.info("Attempting to end dynatrace session")
        await pageActions.endDtSession()
    }

    private getPurchaseDetails(
        buyAmount: number,
        buyPrice: number,
        currentBalance: number,
        instrumentName: string
    ): string {
        const totalPrice = buyAmount * buyPrice

        return (
            `Buying [${buyAmount}] of asset [${instrumentName}] for ` +
            `[${currencyFormatter.format(buyPrice)}] each, total ` +
            `[${currencyFormatter.format(totalPrice)} | ` +
            `${currencyFormatter.format(currentBalance)}]`
        )
    }
}
