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

    const browserPool = createBrowserContextPool({
        name: "main",
        browserOptions: createBrowserOptions({ headless, product: "chrome" }),
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
