import { IPageActions, IHandleWrapper } from "@demoability/loadgen-core"
import { selectors } from "../selectors"
import { gotoPageWithNavBar } from "./common"
import { arrayRandom } from "../utils"
import { reliableClick, reliableNavigateHandle } from "./reliableActions"

export async function gotoInstrumentsPage(
    pageActions: IPageActions
): Promise<void> {
    await gotoPageWithNavBar(pageActions, selectors.navigation_instrumentsPage)
}

export async function gotoInstrumentPage(
    pageActions: IPageActions,
    instrumentHandle: IHandleWrapper
): Promise<void> {
    await reliableNavigateHandle(pageActions, instrumentHandle)
}

export async function getRandomInstrument(
    pageActions: IPageActions
): Promise<IHandleWrapper | undefined> {
    await waitForInstruments(pageActions)
    const instrumentCards = await pageActions.getAllHandles(
        selectors.instrumentsPage_instrumentCard
    )
    return arrayRandom(instrumentCards)
}

export async function getRandomOwnedInstrument(
    pageActions: IPageActions
): Promise<IHandleWrapper | undefined> {
    await waitForInstruments(pageActions)
    const instrumentCards = await pageActions.getAllHandles(
        selectors.instrumentsPage_ownedInstrument
    )
    return arrayRandom(instrumentCards)
}

export async function gotoRandomInstrument(
    pageActions: IPageActions
): Promise<void> {
    await gotoInstrumentsPage(pageActions)
    const instrumentCard = await getRandomInstrument(pageActions)
    if (instrumentCard === undefined) {
        throw new Error(`No instruments available`)
    }
    await gotoInstrumentPage(pageActions, instrumentCard)
}

export async function gotoRandomOwnedInstrument(
    pageActions: IPageActions
): Promise<void> {
    await gotoInstrumentsPage(pageActions)
    const instrumentCard = await getRandomOwnedInstrument(pageActions)
    if (instrumentCard === undefined) {
        throw new Error(`No owned instruments available`)
    }
    await gotoInstrumentPage(pageActions, instrumentCard)
}

export async function selectQuickBuy(pageActions: IPageActions): Promise<void> {
    await reliableClick(pageActions, selectors.instrumentPage_quickBuyForm)
}
export async function selectQuickSell(
    pageActions: IPageActions
): Promise<void> {
    await reliableClick(pageActions, selectors.instrumentPage_quickSellForm)
}
export async function selectBuy(pageActions: IPageActions): Promise<void> {
    await reliableClick(pageActions, selectors.instrumentPage_buyForm)
}
export async function selectSell(pageActions: IPageActions): Promise<void> {
    await reliableClick(pageActions, selectors.instrumentPage_sellForm)
}

export async function getInstrumentName(
    pageActions: IPageActions
): Promise<string> {
    return await pageActions.getInnerText(
        selectors.instrumentPage_instrumentName
    )
}
export async function getInstrumentPrice(
    pageActions: IPageActions
): Promise<number> {
    const priceString = await pageActions.getProperty<string>(
        selectors.instrumentPage_priceInput,
        "value"
    )
    return parseFloat(priceString)
}
export async function getCurrentBalance(
    pageActions: IPageActions
): Promise<number> {
    const balanceString = await pageActions.getProperty<string>(
        selectors.common_currentBalance,
        "value"
    )
    // QuickBuyForm renders this input's value through formatCurrency(), e.g. "$1,234.56" -- strip
    // everything but digits/sign/decimal point before parsing, or parseFloat chokes on the "$"
    // and returns NaN.
    return parseFloat(balanceString.replace(/[^0-9.-]+/g, ""))
}
export async function getInstrumentPossessedAmount(
    pageActions: IPageActions
): Promise<number> {
    const amountString = await pageActions.getProperty<string>(
        selectors.instrumentPage_possessedAmount,
        "value"
    )
    return parseInt(amountString)
}

export async function scheduleTransaction(
    pageActions: IPageActions,
    price: number,
    duration: number,
    amount: number
): Promise<void> {
    await pageActions.input(
        selectors.instrumentPage_amountInput,
        amount.toString()
    )
    await pageActions.standardDelay()
    await pageActions.input(
        selectors.instrumentPage_priceInput,
        price.toString()
    )
    await pageActions.standardDelay()
    await pageActions.input(
        selectors.instrumentPage_timeInput,
        duration.toString()
    )
    await pageActions.standardDelay()
    await reliableClick(pageActions, selectors.instrumentPage_submitButton)
}

export async function trade(
    pageActions: IPageActions,
    amount: number
): Promise<void> {
    await pageActions.input(
        selectors.instrumentPage_amountInput,
        amount.toString()
    )
    await pageActions.standardDelay()
    await reliableClick(pageActions, selectors.instrumentPage_submitButton)
}

async function waitForInstruments(pageActions: IPageActions): Promise<void> {
    await pageActions.getHandle(selectors.instrumentsPage_instrumentCard)
}
