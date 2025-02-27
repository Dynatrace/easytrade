import { useQuery } from "@tanstack/react-query"
import { useQueryContext } from "../QueryContext"
import { Instrument } from "../../../api/instrument/types"
import { instrumentsQuery } from "./queries"

export function useInstrumentsQuery(
    userId?: string,
    initialData?: Instrument[]
) {
    const { getInstruments } = useQueryContext()
    return useQuery({
        ...instrumentsQuery(getInstruments(userId)),
        initialData,
    })
}
