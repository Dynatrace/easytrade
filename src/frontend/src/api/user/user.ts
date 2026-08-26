import { Balance, PresetUser, User } from "./types"
import { backends } from "../backend"

const packages: { [k: string]: string } = { "1": "Starter", "2": "Light", "3": "Pro" }

export async function getUser(userId: string): Promise<User> {
    console.log(`[getUser] API call with userId [${userId}]`)

    try {
        const data = await backends.users.getData(userId)

        return {
            id: data.id,
            firstName: data.firstName,
            lastName: data.lastName,
            packageType: packages[data.packageId] ?? data.packageId,
            email: data.email,
            address: data.address,
        }
    } catch (error) {
        console.error("error: ", error)
        throw new Error(`User with id [${userId}] not found`)
    }
}

export async function getBalance(userId: string): Promise<Balance> {
    console.log(`[getBalance] API call with userId [${userId}]`)

    try {
        const data = await backends.users.getBalance(userId)

        return {
            accountId: data.accountId,
            value: data.value,
        }
    } catch (error) {
        console.error("error: ", error)
        throw new Error(`Balance with account id [${userId}] not found`)
    }
}

export async function getPresetUsers(): Promise<PresetUser[]> {
    console.log("[getPresetUsers] API call")
    try {
        const data = await backends.users.getPreset()
        return data.results.map((u) => ({ ...u }))
    } catch (error) {
        console.error("error: ", error)
        return []
    }
}
