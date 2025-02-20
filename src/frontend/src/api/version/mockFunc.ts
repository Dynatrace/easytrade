import { delay } from "../util"
import { VERSIONS } from "./mockData"
import { ServiceVersion } from "./types"

export async function getAllVersionsMock(): Promise<ServiceVersion[]> {
    console.log("mock [getAllVersions] Get all services versions")
    await delay(1000)
    return VERSIONS
}
