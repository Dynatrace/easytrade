import { getJson, services } from "../http"
import { Instrument } from "./types"
export * from "./types"

type InstrumentsDto = {
    results: Instrument[]
}

export async function getInstruments(
    accountId?: string
): Promise<Instrument[]> {
    // An absent accountId intentionally serialises to the string "undefined";
    const { results } = await getJson<InstrumentsDto>(
        `${services.broker()}/instrument?accountId=${accountId}`
    )
    return results
}
