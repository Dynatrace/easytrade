import { Price } from "../api/price"
import { InstrumentPrice } from "../api/instrument"

export type PriceTrend = {
    trendingUp: boolean
    pctChange: number
    trendClass: "up" | "down"
}

export function priceTrend(price: Price | InstrumentPrice): PriceTrend {
    const trendingUp = price.close >= price.open
    return {
        trendingUp,
        pctChange:
            price.open !== 0 ? (price.close - price.open) / price.open : 0,
        trendClass: trendingUp ? "up" : "down",
    }
}
