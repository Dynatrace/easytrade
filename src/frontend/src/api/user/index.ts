import { getJson, postJson, services } from "../http"
import {
    Balance,
    LoginResponse,
    PresetUser,
    SignupRequest,
    SignupResponse,
    User,
} from "./types"
export * from "./types"

type UserDto = {
    id: string
    packageId: string
    firstName: string
    lastName: string
    email: string
    address: string
}

type PresetUsersDto = { results: PresetUser[] }

// Seeded UUIDs from db/mssql/sql-scripts/sql-packages.sql
const PACKAGES: Record<string, string> = {
    "a0000000-0000-4000-8000-000000000001": "Starter",
    "a0000000-0000-4000-8000-000000000002": "Light",
    "a0000000-0000-4000-8000-000000000003": "Pro",
}

export async function getUser(userId: string): Promise<User> {
    const data = await getJson<UserDto>(`${services.user()}/accounts/${userId}`)
    return {
        id: data.id,
        firstName: data.firstName,
        lastName: data.lastName,
        packageType: PACKAGES[data.packageId] ?? data.packageId,
        email: data.email,
        address: data.address,
    }
}

export async function getBalance(userId: string): Promise<Balance> {
    const { accountId, value } = await getJson<Balance>(
        `${services.broker()}/balance/${userId}`
    )
    return { accountId, value }
}

export async function getPresetUsers(): Promise<PresetUser[]> {
    const { results } = await getJson<PresetUsersDto>(
        `${services.user()}/accounts/presets`
    )
    return results
}

/** A command: reports bad credentials as a value, not an exception. */
export async function login(
    login: string,
    password: string
): Promise<LoginResponse> {
    try {
        return await postJson<LoginResponse>(`${services.user()}/auth/login`, {
            username: login,
            password,
        })
    } catch (error) {
        console.error("[login] failed", error)
        return { error: "Login or password invalid" }
    }
}

export async function signup(request: SignupRequest): Promise<SignupResponse> {
    try {
        return await postJson<SignupResponse>(
            `${services.user()}/auth/signup`,
            {
                packageId: PACKAGES[0],
                origin: "easyTrade",
                firstName: request.firstName,
                lastName: request.lastName,
                username: request.login,
                email: request.email,
                address: request.address,
                password: request.password,
            }
        )
    } catch (error) {
        console.error("[signup] failed", error)
        return { error: "There was an error processing the signup request." }
    }
}
