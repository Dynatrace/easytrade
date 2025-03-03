import { Instrument } from "../../api/instrument/types"
import {
    BuyHandler,
    HandlerResponse,
    QuickBuyHandler,
    QuickSellHandler,
    SellHandler,
} from "../../api/transaction/types"

export type IInstrumentContext = {
    instrument: Instrument
    quickBuyHandler: (amount: number) => Promise<HandlerResponse>
    quickSellHandler: (amount: number) => Promise<HandlerResponse>
    buyHandler: (
        amount: number,
        price: number,
        time: number
    ) => Promise<HandlerResponse>
    sellHandler: (
        amount: number,
        price: number,
        time: number
    ) => Promise<HandlerResponse>
}

export type InstrumentProviderProps = {
    instrument: Instrument
    userId: string
    quickBuyHandler: QuickBuyHandler
    quickSellHandler: QuickSellHandler
    buyHandler: BuyHandler
    sellHandler: SellHandler
}
