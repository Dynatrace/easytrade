import { backends } from "../backend"
import { ConfigFlag, Config, ConfigFlagIds, ConfigDefaults } from "./types"

async function getRawConfigFlags(): Promise<ConfigFlag[]> {
    console.log(`getting config flags from API`)
    try {
        const { data } = await backends.config.getAll()
        console.log(data)
        return data.results.map(({ name, enabled, id }) => ({
            name,
            enabled,
            id,
        }))
    } catch (error) {
        console.error("error: ", error)
        return []
    }
}

function getFlag(
    flags: ConfigFlag[],
    id: string,
    defaultValue: boolean
): boolean {
    return flags.find((flag) => flag.id === id)?.enabled ?? defaultValue
}

export async function getConfig(): Promise<Config> {
    const flags = await getRawConfigFlags()
    return {
        featureFlagManagement: getFlag(
            flags,
            ConfigFlagIds.FEATURE_FLAG_MANAGEMENT,
            ConfigDefaults.featureFlagManagement
        ),
    }
}
