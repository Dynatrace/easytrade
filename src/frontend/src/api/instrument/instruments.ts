import { Instrument } from "./types"
import { backends } from "../backend"

export async function getInstruments(userId?: string): Promise<Instrument[]> {
    console.log(`[getInstruments] API call`)
    try {
        const data = await backends.instruments.getInstruments(userId)
        console.log(`instrument data: `, data)
        return data.results
    } catch (error) {
        console.log("error: ", error)
        return []
    }
}
