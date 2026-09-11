import {
    IHandleWrapper,
    IPageActions,
    ISelector,
} from "@demoability/loadgen-core"

/**
 * `IPageActions.click`/`.navigate` dispatch clicks via Puppeteer's synthetic mouse events
 * (`ElementHandle.click()`). Under real CPU contention -- which is exactly the environment this
 * load generator runs in (multiple concurrent pages sharing a constrained CPU budget) -- those
 * synthetic mouse events can be silently dropped: the click never reaches the page at all, not
 * "slowly", indefinitely. This reproduces reliably even with a single page and zero throttling, as
 * soon as there's a delay (as little as ~200ms, and every action in this load generator is
 * separated by `shortDelay`/`standardDelay`/`longDelay`) between the previous action and the click.
 *
 * A plain DOM `.click()` executed in-page via `evaluate()` does not go through that synthetic
 * input pipeline and does not exhibit the drop problem -- but it's also not a trusted event
 * (`isTrusted: false`), which means the browser's Event Timing API never records it: real users'
 * RUM/INP measurements only ever see the *next* trusted event, if any, and attribute whatever
 * duration elapsed to it, producing bogus outliers. So: try the trusted `ElementHandle.click()`
 * first and verify it actually landed via a capturing listener (capture-phase listeners on an
 * ancestor still fire for clicks dispatched on a nested descendant), and only fall back to the
 * always-lands-but-untrusted in-page DOM click if it didn't.
 *
 * Separately: `IPageActions.scrollIntoView()` (called internally by `clickHandle`) only calls
 * `handle.focus()` and then polls `isIntersectingViewport()` in an **unbounded loop with no
 * timeout** -- it never actually scrolls anything. That silently hangs forever for any element
 * that isn't natively focusable (e.g. `//li[@id="logoutItem"]` has no `tabindex`, so `.focus()` is
 * a no-op) and starts out of view. `domClickHandle` does its own bounded, DOM-based
 * `scrollIntoView({ block: "center" })` first instead of relying on that.
 */

async function domScrollIntoView(
    pageActions: IPageActions,
    handle: IHandleWrapper
): Promise<void> {
    await pageActions.evaluate((el) => {
        ;(el as HTMLElement).scrollIntoView({
            block: "center",
            inline: "nearest",
        })
    }, handle.getHandle())
}

async function domClickHandle(
    pageActions: IPageActions,
    handle: IHandleWrapper
): Promise<void> {
    await domScrollIntoView(pageActions, handle)

    await pageActions.evaluate((el) => {
        const target = el as HTMLElement
        target.dataset.loadgenClickLanded = "0"
        target.addEventListener(
            "click",
            () => {
                target.dataset.loadgenClickLanded = "1"
            },
            { capture: true, once: true }
        )
    }, handle.getHandle())

    await pageActions.clickHandle(handle).catch(() => undefined)
    await pageActions.sleep(50, 0)

    const landed = await pageActions.evaluate(
        (el) => (el as HTMLElement).dataset.loadgenClickLanded === "1",
        handle.getHandle()
    )
    if (landed) return

    // Hit-test like a real click instead of calling .click() on the selector match directly:
    // some selectors target a container whose actual interactive element is a descendant (e.g.
    // `//li[@id="logoutItem"]` wraps a nested `<button onClick=...>`). A click event dispatched
    // via el.click() only bubbles *up* to ancestors, never down to descendants, so clicking the
    // container directly would silently miss a nested handler. Puppeteer's coordinate-based
    // synthetic click naturally hit-tests to whatever's visually on top, which is why this wasn't
    // an issue before; elementFromPoint() reproduces that same targeting while staying an in-page
    // DOM click (so it isn't subject to the synthetic-input-dropped-under-contention issue).
    await pageActions.evaluate((el) => {
        const rect = (el as HTMLElement).getBoundingClientRect()
        const x = rect.left + rect.width / 2
        const y = rect.top + rect.height / 2
        const target =
            (document.elementFromPoint(x, y) as HTMLElement | null) ??
            (el as HTMLElement)
        target.click()
    }, handle.getHandle())
}

async function waitForNavigation(
    pageActions: IPageActions,
    before: unknown,
    selectorDescription: string,
    timeoutMs: number
): Promise<void> {
    const start = Date.now()
    while (Date.now() - start < timeoutMs) {
        const after = await pageActions.evaluate(() => location.href)
        if (after !== before) return
        await pageActions.sleep(200, 0)
    }
    throw new Error(
        `reliableNavigate: no navigation detected after clicking [${selectorDescription}]`
    )
}

export async function reliableClick(
    pageActions: IPageActions,
    selector: ISelector
): Promise<void> {
    const handle = await pageActions.getHandle(selector)
    await domClickHandle(pageActions, handle)
}

export async function reliableNavigate(
    pageActions: IPageActions,
    selector: ISelector,
    timeoutMs = 10000
): Promise<void> {
    const handle = await pageActions.getHandle(selector)
    await reliableNavigateHandle(
        pageActions,
        handle,
        timeoutMs,
        selector.toString()
    )
}

export async function reliableNavigateHandle(
    pageActions: IPageActions,
    handle: IHandleWrapper,
    timeoutMs = 10000,
    description = handle.toString()
): Promise<void> {
    const before = await pageActions.evaluate(() => location.href)
    await domClickHandle(pageActions, handle)
    await waitForNavigation(pageActions, before, description, timeoutMs)
}
