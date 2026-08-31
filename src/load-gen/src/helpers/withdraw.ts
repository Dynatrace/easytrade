import { IPageActions } from "@demoability/loadgen-core"
import { User } from "../user"
import { selectors } from "../selectors"
import { gotoPageWithNavBar, selectCardProvider } from "./common"
import { CREDIT_CARD_MAPPING } from "../const"

/**
 * Assumes starting point Withdraw page.
 * Endpoint Withdraw page.
 *
 * @param pageActions
 * @param user
 * @param value
 */
export async function withdraw(
    pageActions: IPageActions,
    user: User,
    value: number
): Promise<void> {
    await pageActions.input(selectors.depositPage_amount, `${value}`)
    await pageActions.standardDelay()
    await fillUserWithdrawData(pageActions, user)
    await pageActions.click(selectors.depositPage_acceptTerms)
    await pageActions.shortDelay()
    await pageActions.click(selectors.depositPage_submit)
}

export async function gotoWithdrawPage(
    pageActions: IPageActions
): Promise<void> {
    await gotoPageWithNavBar(pageActions, selectors.navigation_withdrawPage)
}

async function fillUserWithdrawData(
    pageActions: IPageActions,
    user: User
): Promise<void> {
    const fullName = `${user.first_name} ${user.last_name}`

    await pageActions.input(selectors.depositPage_cardholderName, fullName)
    await pageActions.standardDelay()
    await pageActions.input(selectors.depositPage_address, user.address)
    await pageActions.standardDelay()
    await pageActions.input(selectors.depositPage_email, user.email)
    await pageActions.standardDelay()
    await pageActions.input(
        selectors.depositPage_cardNumber,
        user.credit_card_number
    )
    await pageActions.standardDelay()
    await selectCardProvider(
        pageActions,
        selectors.depositPage_cardType,
        CREDIT_CARD_MAPPING[user.credit_card_provider]
    )
    await pageActions.standardDelay()
}
