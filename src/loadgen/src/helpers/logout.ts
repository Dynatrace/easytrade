import { IPageActions } from "@demoability/loadgen-core"
import { selectors } from "../selectors"
import { reliableClick, reliableNavigate } from "./reliableActions"

/**
 * Assumes user is logged in.
 * Endpoint on login screen
 *
 * @param pageActions
 */
export async function logout(pageActions: IPageActions): Promise<void> {
    await reliableClick(pageActions, selectors.navigation_dropdownToggler)
    await pageActions.shortDelay()
    await reliableNavigate(pageActions, selectors.navigation_logout)
}
