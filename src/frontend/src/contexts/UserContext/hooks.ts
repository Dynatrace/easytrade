import { Balance, User } from "../../api/user"
import { useBalanceQuery, useUserQuery } from "../../hooks/useUser"
import { useAuthUser } from "./context"

export function useAuthUserData(): { user?: User; balance?: Balance } {
    const { userId } = useAuthUser()
    return {
        user: useUserQuery(userId).data,
        balance: useBalanceQuery(userId).data,
    }
}
