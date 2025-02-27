import { IPageActions } from "@demoability/loadgen-core"
import { selectors } from "../selectors"

/**
 * Assumes user is logged in.
 * Endpoint on login screen
 *
 * @param pageActions
 */
export async function logout(pageActions: IPageActions): Promise<void> {
    await pageActions.click(selectors.navigation_dropdownToggler)
    await pageActions.shortDelay()
    await pageActions.navigate(selectors.navigation_logout)
}
