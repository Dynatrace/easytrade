import { Instrument } from "./types"
import axios from "axios"
import { backends } from "../backend"

export async function getInstruments(userId?: string): Promise<Instrument[]> {
    console.log(`[getInstruments] API call`)
    try {
        const { data } = await backends.instruments.getInstruments(userId)
        console.log(`instrument data: `, data)

        return data.results
    } catch (error) {
        if (axios.isAxiosError(error)) {
            console.log("Axios error message: ", error.message)
        } else {
            console.log("Unexpected error: ", error)
        }
        return []
    }
}
