import { delay } from "../util"
import { INSTRUMENTS } from "./mockData"
import { Instrument } from "./types"

export async function getInstrumentsMock(): Promise<Instrument[]> {
    console.log(`mock [getInstruments] API call`)
    await delay(1000)
    return INSTRUMENTS
}
