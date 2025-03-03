import { IVisit, randomBetween } from "@demoability/loadgen-core"
import { Config } from "../config"
import { getRandomUser } from "../user"
import {
    DepositAndBuyVisit,
    DepositAndLongBuyVisit,
    LongSellVisit,
    RegularVisits,
    SellAndWithdrawVisit,
    errorBuyCalculator,
    errorSellCalculator,
    successBuyCalculator,
    successSellCalculator,
    timeoutBuyCalculator,
    timeoutSellCalculator,
} from "../visits"

export function getDepositValue({
    visitsConfig: { depositMinValue, depositMaxValue },
}: Config): number {
    return randomBetween(depositMinValue, depositMaxValue)
}

export function getTransactionDuration({
    visitsConfig: { transactionMinDuration, transactionMaxDuration },
}: Config): number {
    return Math.floor(
        randomBetween(transactionMinDuration, transactionMaxDuration)
    )
}

export function getRegularProviderFunction(
    config: Config
): (name: RegularVisits) => IVisit {
    const {
        visitsConfig: { easytradeUrl, assetSellRatio, withdrawMinValue },
    } = config
    return (name: RegularVisits) => {
        const user = getRandomUser()
        switch (name) {
            case "deposit_and_long_buy_success": {
                return new DepositAndLongBuyVisit(
                    "deposit_and_long_buy_success",
                    successBuyCalculator,
                    easytradeUrl,
                    user,
                    getDepositValue(config),
                    getTransactionDuration(config)
                )
            }
            case "deposit_and_long_buy_timeout": {
                return new DepositAndLongBuyVisit(
                    "deposit_and_long_buy_timeout",
                    timeoutBuyCalculator,
                    easytradeUrl,
                    user,
                    getDepositValue(config),
                    getTransactionDuration(config)
                )
            }
            case "deposit_and_long_buy_error": {
                return new DepositAndLongBuyVisit(
                    "deposit_and_long_buy_error",
                    errorBuyCalculator,
                    easytradeUrl,
                    user,
                    getDepositValue(config),
                    getTransactionDuration(config)
                )
            }
            case "long_sell_success": {
                return new LongSellVisit(
                    "long_sell_success",
                    successSellCalculator,
                    easytradeUrl,
                    user,
                    assetSellRatio,
                    getTransactionDuration(config)
                )
            }
            case "long_sell_timeout": {
                return new LongSellVisit(
                    "long_sell_timeout",
                    timeoutSellCalculator,
                    easytradeUrl,
                    user,
                    assetSellRatio,
                    getTransactionDuration(config)
                )
            }
            case "long_sell_error": {
                return new LongSellVisit(
                    "long_sell_error",
                    errorSellCalculator,
                    easytradeUrl,
                    user,
                    assetSellRatio,
                    getTransactionDuration(config)
                )
            }
            case "deposit_and_buy_success": {
                return new DepositAndBuyVisit(
                    "deposit_and_buy_success",
                    easytradeUrl,
                    user,
                    getDepositValue(config)
                )
            }
            case "sell_and_withdraw_success": {
                return new SellAndWithdrawVisit(
                    "sell_and_withdraw_success",
                    easytradeUrl,
                    user,
                    assetSellRatio,
                    withdrawMinValue
                )
            }
        }
    }
}
