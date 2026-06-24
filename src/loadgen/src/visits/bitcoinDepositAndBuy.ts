import { IPageActions, IVisit, randomBetween } from "@demoability/loadgen-core"
import { User } from "../user"
import { gotoDepositPageBitcoin, depositBitcoin } from "../helpers/bitcoinDeposit"
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
import { Logger } from "winston"
import { VisitName } from "./types"
import { Page } from "puppeteer"

export class BitcoinDepositAndBuyVisit implements IVisit {
    readonly visitName: VisitName
    readonly url: URL
    readonly user: User
    readonly btcAmount: number

    constructor(visitName: VisitName, url: URL, user: User, btcAmount: number) {
        this.visitName = visitName
        this.url = url
        this.user = user
        this.btcAmount = btcAmount
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

        const usdEquivalent = this.btcAmount * 65000
        logger.info(
            `Depositing [${this.btcAmount} BTC (~${currencyFormatter.format(usdEquivalent)})] for user [${this.user.username}]`
        )
        await gotoDepositPageBitcoin(pageActions)
        await depositBitcoin(pageActions, this.btcAmount)

        logger.info("Choosing which instrument to buy")
        await gotoRandomInstrument(pageActions)
        await selectQuickBuy(pageActions)
        const instrumentPrice = await getInstrumentPrice(pageActions)
        const currentBalance = await getCurrentBalance(pageActions)
        const instrumentName = await getInstrumentName(pageActions)
        const buyAmount = Math.floor(
            randomBetween(1, usdEquivalent / instrumentPrice)
        )
        logger.info(
            `Buying [${buyAmount}] of [${instrumentName}] @ [${currencyFormatter.format(instrumentPrice)}] ` +
            `(balance: [${currencyFormatter.format(currentBalance)}])`
        )
        await trade(pageActions, buyAmount)

        logger.info(`Logging out user [${this.user.username}]`)
        await logout(pageActions)

        logger.info("Attempting to end dynatrace session")
        await pageActions.endDtSession()
    }
}
