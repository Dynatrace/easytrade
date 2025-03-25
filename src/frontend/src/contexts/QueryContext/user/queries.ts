import { QueryClient, QueryFunction } from "@tanstack/react-query"
import { PresetUser, User, Balance } from "../../../api/user/types"
import { QueryParams } from "../types"
import { transactionKeys } from "../transaction/queries"
import { instrumentKeys } from "../instrument/queries"
import { creditCardKeys } from "../creditCard/queries"

export const userKeys = {
    all: ["users"] as const,
    preset: ["users", "preset"] as const,
    current: ["users", "current"] as const,
}

export const balanceKeys = {
    current: ["balance"] as const,
}

export function userQuery(queryFn: QueryFunction<User>): QueryParams<User> {
    return {
        queryKey: userKeys.current,
        queryFn,
    }
}

export function balanceQuery(
    queryFn: QueryFunction<Balance>
): QueryParams<Balance> {
    return {
        queryKey: balanceKeys.current,
        queryFn,
    }
}

export function presetUsersQuery(
    queryFn: QueryFunction<PresetUser[]>
): QueryParams<PresetUser[]> {
    return {
        queryKey: userKeys.preset,
        queryFn,
    }
}

export async function transactionInvalidateQuery(client: QueryClient) {
    await client.invalidateQueries({ queryKey: transactionKeys.all })
}

export function logoutInvalidateQuery(client: QueryClient) {
    client.removeQueries({ queryKey: transactionKeys.all })
    client.removeQueries({ queryKey: instrumentKeys.all })
    client.removeQueries({ queryKey: userKeys.current })
    client.removeQueries({ queryKey: balanceKeys.current })
    client.removeQueries({ queryKey: creditCardKeys.all })
}

export async function quickTransactionInvalidateQuery(client: QueryClient) {
    await client.invalidateQueries({ queryKey: balanceKeys.current })
    await client.invalidateQueries({
        queryKey: instrumentKeys.all,
    })
}

export async function balanceInvalidateQuery(client: QueryClient) {
    await client.invalidateQueries({ queryKey: balanceKeys.current })
}
