import {
    createLoadgen,
    createLoggerOptions,
    createBrowserContextPool,
    createBrowserOptions,
} from "@demoability/loadgen-core"
import { getConfig } from "./config"
import { getProvider } from "./provider"
import { Page } from "puppeteer"
import {
    StatsAggregator,
    StatsRunner,
} from "@demoability/loadgen-core/lib/stats"
import { TIME_UNITS } from "@demoability/loadgen-core/lib/time"

async function main() {
    const config = getConfig()

    const provider = getProvider(config)
    const headless = config.headlessMode === "headless"

    const baseBrowserOptions = createBrowserOptions({
        headless,
        product: "chrome",
    })
    const browserPool = createBrowserContextPool({
        name: "main",
        browserOptions: {
            ...baseBrowserOptions,
            args: [
                ...(baseBrowserOptions.args ?? []),
                // EasyTrade is served over plain HTTP on a public IP. Chrome's
                // HTTPS-First (Balanced) auto-enable upgrades the navigation to
                // https://, port 443 is closed, and puppeteer reports
                // net::ERR_BLOCKED_BY_CLIENT.
                "--disable-features=HttpsFirstBalancedModeAutoEnable,HttpsFirstModeV2ForTypicallySecureUsers",
            ],
        },
        loggerOptions: createLoggerOptions("browser", {
            logLevel: config.logLevel,
        }),
        browserTimeToLiveMs: config.browserTimeToLiveMinutes * 60_000,
        concurrentBrowsers: config.concurrent_browsers,
    })

    const statAggregator = new StatsAggregator(Date.now())
    const statRunner = new StatsRunner(
        { unit: TIME_UNITS.MINUTE, quantity: 5 },
        { unit: TIME_UNITS.HOUR, quantity: 24 },
        statAggregator,
        TIME_UNITS.MINUTE,
        [
            { unit: TIME_UNITS.MINUTE, quantity: 5 },
            { unit: TIME_UNITS.HOUR, quantity: 1 },
        ],
        createLoggerOptions("stats")
    )

    const loadgen = createLoadgen({
        visitProvider: provider,
        loggerOptions: createLoggerOptions("visit", {
            logLevel: config.logLevel,
        }),
        contextPool: browserPool,
        concurrency: config.concurrent_visits,
        initialPageSetup: async (page: Page) => {
            await page.setViewport({ width: 1920, height: 1080 })
        },
        pageActionsConfig: {
            longDelayMs: 3000,
            shortDelayMs: 500,
            standDelayMs: 1500,
        },
        statsRunner: statRunner,
    })

    await loadgen.run()
}

main()
