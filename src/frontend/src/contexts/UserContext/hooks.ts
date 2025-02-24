import { useRouteLoaderData } from "react-router"
import { Balance, User } from "../../api/user/types"
import { useBalanceQuery, useUserQuery } from "../QueryContext/user/hooks"
import { useAuthUser } from "./context"
import { LoaderIds } from "../../router"

export function useAuthUserData(): { user?: User; balance?: Balance } {
    const { userId } = useAuthUser()
    const [userData, balanceData] = useRouteLoaderData(LoaderIds.user) as [
        User?,
        Balance?,
    ]
    return {
        user: useUserQuery(userId, userData).data,
        balance: useBalanceQuery(userId, balanceData).data,
    }
}
