import { IPageActions, ISelector } from "@demoability/loadgen-core"
import { selectors } from "../selectors"
import { User } from "../user"
import { Page } from "puppeteer"

export const currencyFormatter = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
})

export async function selectCardProvider(
    pageActions: IPageActions,
    cardProviderSelector: ISelector,
    cardProvider: string
): Promise<void> {
    await pageActions.click(cardProviderSelector)
    const providerHandle = await pageActions.getHandle(
        selectors.depositPage_cardType_provider(cardProvider)
    )
    await pageActions.shortDelay()
    await pageActions.clickHandle(providerHandle)
}

export async function showNavbar(pageActions: IPageActions): Promise<void> {
    // wait in case the navbar autohides after it already appears
    await pageActions.standardDelay()
    const navBarOpen = await pageActions.isSelectorPresent(
        selectors.navigation_homePage
    )
    if (navBarOpen) {
        return
    }
    await pageActions.click(selectors.navigation_sidebarToggler)
    await pageActions.shortDelay()
}

export async function hideNavbar(pageActions: IPageActions): Promise<void> {
    // wait in case the navbar autohides after it already appears
    await pageActions.standardDelay()
    const navBarOpen = await pageActions.isSelectorPresent(
        selectors.navigation_homePage
    )
    if (!navBarOpen) {
        return
    }
    await pageActions.click(selectors.navigation_sidebarToggler)
    await pageActions.shortDelay()
}

export async function gotoPageWithNavBar(
    pageActions: IPageActions,
    navBarSelector: ISelector
): Promise<void> {
    await showNavbar(pageActions)
    await pageActions.navigate(navBarSelector)
}

export async function pageSetup(page: Page, user: User, appUrl: URL) {
    await page.setUserAgent(user.user_agent)
    await page.setExtraHTTPHeaders({ "x-forwarded-for": user.ip4 })
    await page.setCookie({
        name: "rxVisitor",
        value: user.visitor_id,
        domain: appUrl.hostname,
        path: "/",
    })
}
