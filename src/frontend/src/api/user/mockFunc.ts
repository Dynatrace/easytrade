import { delay } from "../util"
import { PresetUser, User } from "./types"
import { USERS, PRESET_USERS } from "./mockData"

export async function getUserMock(userId: string): Promise<User> {
    console.log(`mock [getUser] API call with userId [${userId}]`)
    await delay(1000)
    const user = USERS.find(({ id }) => id.toString() === userId)
    console.log(`mock [getUser] API found user [${JSON.stringify(user)}]`)
    if (user === undefined) {
        throw new Error(`User with id [${userId}] not found`)
    }
    return {
        id: user.id.toString(),
        firstName: user.firstName,
        lastName: user.lastName,
        packageType: user.packageId.toString(),
        email: user.email,
        address: user.address,
    }
}

export async function getPresetUsersMock(): Promise<PresetUser[]> {
    console.log("mock [getPresetUsers] API call")
    await delay(1000)
    return PRESET_USERS.map(({ id, firstName, lastName }) => ({
        id: id.toString(),
        firstName: firstName,
        lastName: lastName,
    }))
}
