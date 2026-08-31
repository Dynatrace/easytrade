import { VisitsWeights } from "../provider"
import { RegularVisits } from "../visits/types"

export const HEADLESS_MODES = ["headless", "headfull"] as const
export type HeadlessMode = (typeof HEADLESS_MODES)[number]

export type VisitsConfig = {
    depositMinValue: number
    depositMaxValue: number
    assetSellRatio: number
    withdrawMinValue: number
    transactionMinDuration: number
    transactionMaxDuration: number
    easytradeUrl: URL
}

export type ProviderConfig =
    | {
          type: "constant"
      }
    | {
          type: "NYSE"
          offHoursLoadFactor: number
          timeframeMinutes: number
          learnTimeFactor: number
      }

export type Config = {
    concurrent_visits: number
    concurrent_browsers: number
    browserTimeToLiveMinutes: number
    logLevel: string
    rareVisitsIntervalMinutes: number
    headlessMode: HeadlessMode
    visitsConfig: VisitsConfig
    providerConfig: ProviderConfig
    regularVisitsWeights: VisitsWeights<RegularVisits>
}
