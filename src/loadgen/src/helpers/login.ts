import { IPageActions } from "@demoability/loadgen-core"
import { User } from "../user"
import { selectors } from "../selectors"

/**
 * Assumes starting point on login screen.
 * End point on user Dashboard
 *
 * @param pageActions
 * @param user
 */
export async function login(
    pageActions: IPageActions,
    user: User
): Promise<void> {
    await pageActions.input(selectors.loginPage_username, user.username)
    await pageActions.shortDelay()
    await pageActions.input(selectors.loginPage_password, user.password)
    await pageActions.shortDelay()
    await pageActions.navigate(selectors.loginPage_loginButton)
}
