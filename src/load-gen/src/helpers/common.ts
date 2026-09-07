import { IPageActions, ISelector } from "@demoability/loadgen-core"
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
    await pageActions.selectOption(cardProviderSelector, cardProvider)
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
