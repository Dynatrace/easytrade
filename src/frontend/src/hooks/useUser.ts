import { queryOptions, useQuery } from "@tanstack/react-query"
import { redirect } from "react-router"
import {
    Balance,
    PresetUser,
    User,
    getBalance,
    getPresetUsers,
    getUser,
} from "../api/user"
import { SESSION_KEY } from "../contexts/AuthContext/storage"
import { queryClient } from "../utils/queryClient"
import { balanceKeys, userKeys } from "../utils/queryKeys"

export function userQuery(userId: string) {
    return queryOptions({
        queryKey: userKeys.byId(userId),
        queryFn: () => getUser(userId),
    })
}

export function balanceQuery(userId: string) {
    return queryOptions({
        queryKey: balanceKeys.byId(userId),
        queryFn: () => getBalance(userId),
    })
}

export function presetUsersQuery() {
    return queryOptions({
        queryKey: userKeys.preset,
        queryFn: getPresetUsers,
    })
}

export function useUserQuery(userId: string, initialData?: User) {
    return useQuery({
        ...userQuery(userId),
        initialData,
        enabled: userId !== "",
    })
}

export function useBalanceQuery(userId: string, initialData?: Balance) {
    return useQuery({
        ...balanceQuery(userId),
        initialData,
        enabled: userId !== "",
    })
}

export function usePresetUsersQuery(initialData?: PresetUser[]) {
    const result = useQuery({ ...presetUsersQuery(), initialData })
    return { ...result, data: result.data ?? [] }
}

export function requireUser<T>(load: (userId: string) => Promise<T>) {
    return async () => {
        const userId = sessionStorage.getItem(SESSION_KEY)
        if (userId === null || userId === "") {
            return redirect("/login")
        }
        return await load(userId)
    }
}

export const userAndBalanceLoader = requireUser((userId) =>
    Promise.all([
        queryClient.ensureQueryData(userQuery(userId)),
        queryClient.ensureQueryData(balanceQuery(userId)),
    ])
)

export async function presetUsersLoader() {
    try {
        return await queryClient.ensureQueryData(presetUsersQuery())
    } catch (error) {
        console.error("[presetUsersLoader] failed", error)
        return []
    }
}
