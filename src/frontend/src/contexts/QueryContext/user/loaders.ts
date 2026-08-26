import { QueryClient } from "@tanstack/react-query"
import { redirect } from "react-router"
import { PresetUser, User, Balance } from "../../../api/user/types"
import { transform } from "../QueryContext"
import { balanceQuery, presetUsersQuery, userQuery } from "./queries"

export function sessionUserProvider() {
    // sessionStorage.setItem stores the raw string value (no JSON wrapper);
    // the old usehooks-ts implementation JSON-serialised the value, requiring
    // JSON.parse here — that is no longer needed after the Stage 1 rewrite of
    // storage.ts.
    return sessionStorage.getItem("user-id")
}

export function loadWithUser<T = unknown>(
    userIdProvider: () => string | null,
    loader: (userId: string) => Promise<T>
) {
    return async () => {
        const userId = userIdProvider()
        if (userId === null || userId === "") {
            return redirect("/login")
        }
        return await loader(userId)
    }
}

export function userLoader(
    client: QueryClient,
    userProvider: (userId: string) => Promise<User>
) {
    const queryFn = transform(userProvider)
    return async (userId: string) => {
        return await client.ensureQueryData(userQuery(queryFn(userId)))
    }
}

export function balanceLoader(
    client: QueryClient,
    balanceProvider: (userId: string) => Promise<Balance>
) {
    const queryFn = transform(balanceProvider)
    return async (userId: string) => {
        return await client.ensureQueryData(balanceQuery(queryFn(userId)))
    }
}

export function presetUsersLoader(
    client: QueryClient,
    usersProvider: () => Promise<PresetUser[]>
) {
    return async () => {
        return await client.ensureQueryData(presetUsersQuery(usersProvider))
    }
}
