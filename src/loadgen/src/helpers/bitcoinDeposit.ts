import { IPageActions } from "@demoability/loadgen-core"
import { selectors } from "../selectors"
import { gotoPageWithNavBar } from "./common"

// Demo wallet address (Bitcoin genesis block) used for load generation
const DEMO_BTC_WALLET = "1A1zP1eP5QGefi2DMPTfTL5SLmv7Divfna"

export async function gotoDepositPageBitcoin(
    pageActions: IPageActions
): Promise<void> {
    await gotoPageWithNavBar(pageActions, selectors.navigation_depositPage)
    await pageActions.click(selectors.depositPage_bitcoinTab)
    await pageActions.shortDelay()
}

export async function depositBitcoin(
    pageActions: IPageActions,
    btcAmount: number
): Promise<void> {
    await pageActions.input(selectors.depositPage_btcAmount, `${btcAmount}`)
    await pageActions.standardDelay()
    await pageActions.input(selectors.depositPage_walletAddress, DEMO_BTC_WALLET)
    await pageActions.standardDelay()
    await pageActions.click(selectors.depositPage_acceptTerms)
    await pageActions.shortDelay()
    await pageActions.click(selectors.depositPage_submit)
}
