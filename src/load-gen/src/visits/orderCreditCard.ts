import { IPageActions, IVisit } from "@demoability/loadgen-core"
import { User } from "../user"

import {
    checkIfCardActive,
    checkIfOrderPending,
    gotoCreditCardPage,
    orderCard,
    revokeCard,
} from "../helpers/creditCard"
import { login } from "../helpers/login"
import { logout } from "../helpers/logout"
import { Logger } from "winston"
import { VisitName } from "./types"
import { Page } from "puppeteer"
import { pageSetup } from "../helpers/common"

export class OrderCreditCardVisit implements IVisit {
    readonly visitName: VisitName
    readonly url: URL
    readonly user: User
    readonly cardType: string

    constructor(visitName: VisitName, url: URL, user: User, cardType: string) {
        this.visitName = visitName
        this.url = url
        this.user = user
        this.cardType = cardType
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
        logger.info(`Logging in as user [${this.user.username}]`)
        await login(pageActions, this.user)

        await gotoCreditCardPage(pageActions)
        await this.orderCard(pageActions, logger)

        logger.info(`Logging out user [${this.user.username}]`)
        await logout(pageActions)

        await pageActions.endDtSession()
    }

    private async orderCard(pageActions: IPageActions, logger: Logger) {
        const orderPending = await checkIfOrderPending(pageActions)
        if (orderPending) {
            logger.warn(
                `user [${this.user.username}] has a pending credit card order, ending visit early`
            )
            return
        }
        const cardRevoked = await checkIfCardActive(pageActions)
        if (cardRevoked) {
            logger.info(
                `User [${this.user.username}] has active card, revoking it so new one can be ordered.`
            )
            await revokeCard(pageActions)
        }
        logger.info(
            `Ordering card [type::${this.cardType}] for user [${this.user.username}]`
        )
        await orderCard(pageActions, this.user, this.cardType)
    }

    getName(): string {
        return this.visitName
    }
}
