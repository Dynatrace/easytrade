import { delay } from "../util"
import { LATEST_PRICES } from "./mockData"
import { Price } from "./types"

export async function getLatestPricesMock(): Promise<Price[]> {
    console.log(`mock [getLatestPrices] API call`)
    await delay(1000)
    return LATEST_PRICES.map(({ id, instrumentId, ...rest }) => ({
        id: id.toString(),
        instrumentId: instrumentId.toString(),
        ...rest,
    }))
}
