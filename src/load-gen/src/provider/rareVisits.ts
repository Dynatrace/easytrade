import { IVisit } from "@demoability/loadgen-core"
import { Config } from "../config"
import { getRandomUser } from "../user"
import { OrderCreditCardVisit } from "../visits"
import { arrayRandom } from "../utils"
import { EASYTRADE_CREDIT_CARD_TYPES } from "../const"

export function getRareVisitInterval(config: Config): number {
    return config.rareVisitsIntervalMinutes * 60 * 1000
}

export function getRareProviderFunction(config: Config): () => IVisit {
    const {
        visitsConfig: { easytradeUrl },
    } = config
    return () => {
        const user = getRandomUser()
        const cardType = arrayRandom(EASYTRADE_CREDIT_CARD_TYPES) as string
        return new OrderCreditCardVisit(
            "order_credit_card",
            easytradeUrl,
            user,
            cardType
        )
    }
}
