import { IPageActions } from "@demoability/loadgen-core"
import { User } from "../user"
import { selectors } from "../selectors"
import { gotoPageWithNavBar } from "./common"

export async function gotoCreditCardPage(
    pageActions: IPageActions
): Promise<void> {
    await gotoPageWithNavBar(pageActions, selectors.navigation_creditCardPage)
}

export async function orderCard(
    pageActions: IPageActions,
    user: User,
    cardType: string
): Promise<void> {
    await pageActions.input(
        selectors.creditCardPage_nameInput,
        `${user.first_name} ${user.last_name}`
    )
    await pageActions.standardDelay()
    await pageActions.input(selectors.creditCardPage_addressInput, user.address)
    await pageActions.standardDelay()
    await pageActions.input(selectors.creditCardPage_emailInput, user.email)
    await pageActions.standardDelay()
    // Native <select id="type">: select by value attribute ("silver"/"gold"/"platinum").
    await pageActions.selectOption(selectors.creditCardPage_cardTypeInput, cardType.toLowerCase())
    await pageActions.standardDelay()
    await pageActions.click(selectors.creditCardPage_acceptTerms)
    await pageActions.standardDelay()
    await pageActions.click(selectors.creditCardPage_orderCardButton)
}

export async function revokeCard(pageActions: IPageActions): Promise<void> {
    await pageActions.navigate(selectors.creditCardPage_revokeCard)
}

export async function checkIfCardActive(
    pageActions: IPageActions
): Promise<boolean> {
    return await pageActions.isSelectorPresent(
        selectors.creditCardPage_revokeCard
    )
}

export async function checkIfOrderPending(
    pageActions: IPageActions
): Promise<boolean> {
    return await pageActions.isSelectorPresent(
        selectors.creditCardPage_orderIdDisplay
    )
}
