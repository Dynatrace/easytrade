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
    // Static sidebar — sidebar is always visible, use native <select> directly
    await pageActions.click(cardProviderSelector)
    const providerHandle = await pageActions.getHandle(
        selectors.depositPage_cardType_provider(cardProvider)
    )
    await pageActions.shortDelay()
    await pageActions.clickHandle(providerHandle)
}

// showNavbar / hideNavbar are no-ops: the sidebar is now static and always visible.
export async function showNavbar(_pageActions: IPageActions): Promise<void> {
    // no-op: static sidebar is always visible
}

export async function hideNavbar(_pageActions: IPageActions): Promise<void> {
    // no-op: static sidebar is always visible
}

export async function gotoPageWithNavBar(
    pageActions: IPageActions,
    navBarSelector: ISelector
): Promise<void> {
    // Sidebar always visible — navigate directly without toggling
    await pageActions.navigate(navBarSelector)
    await pageActions.standardDelay()
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
