import { Balance, PresetUser, User } from "./types"
import axios from "axios"
import { backends } from "../backend"

const packages: { [k: number]: string } = { 1: "Starter", 2: "Light", 3: "Pro" }

export async function getUser(userId: string): Promise<User> {
    console.log(`[getUser] API call with userId [${userId}]`)

    try {
        const { data } = await backends.users.getData(userId)

        return {
            id: data.id.toString(),
            firstName: data.firstName,
            lastName: data.lastName,
            packageType: packages[data.packageId] ?? data.packageId.toString(),
            email: data.email,
            address: data.address,
        }
    } catch (error) {
        if (axios.isAxiosError(error)) {
            console.error("Axios error message: ", error.message)
        } else {
            console.error("Unexpected error: ", error)
        }
        throw new Error(`User with id [${userId}] not found`)
    }
}

export async function getBalance(userId: string): Promise<Balance> {
    console.log(`[getBalance] API call with userId [${userId}]`)

    try {
        const { data } = await backends.users.getBalance(userId)

        return {
            accountId: data.accountId.toString(),
            value: data.value,
        }
    } catch (error) {
        if (axios.isAxiosError(error)) {
            console.error("Axios error message: ", error.message)
        } else {
            console.error("Unexpected error: ", error)
        }
        throw new Error(`Balance with account id [${userId}] not found`)
    }
}

export async function getPresetUsers(): Promise<PresetUser[]> {
    console.log("[getPresetUsers] API call")
    try {
        const { data } = await backends.users.getPreset()
        return data.results.map(({ id, ...rest }) => ({
            id: id.toString(),
            ...rest,
        }))
    } catch (error) {
        if (axios.isAxiosError(error)) {
            console.error("Axios error message: ", error.message)
        } else {
            console.error("Unexpected error: ", error)
        }
        return []
    }
}
