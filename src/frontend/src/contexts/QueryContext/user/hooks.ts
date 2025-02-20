import { useQuery } from "@tanstack/react-query"
import { PresetUser, User, Balance } from "../../../api/user/types"
import { useQueryContext } from "../QueryContext"
import { balanceQuery, presetUsersQuery, userQuery } from "./queries"

export function useUserQuery(userId: string, initialData?: User) {
    const { getUser } = useQueryContext()
    return useQuery({
        ...userQuery(getUser(userId)),
        initialData,
    })
}

export function useBalanceQuery(userId: string, initialData?: Balance) {
    const { getBalance } = useQueryContext()
    return useQuery({
        ...balanceQuery(getBalance(userId)),
        initialData,
    })
}

export function usePresetUsersQuery(initialData?: PresetUser[]) {
    const { getPresetUsers } = useQueryContext()
    return useQuery({
        ...presetUsersQuery(getPresetUsers),
        initialData,
    })
}
