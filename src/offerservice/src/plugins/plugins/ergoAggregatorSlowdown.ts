import { IPlugin } from "../types"
import { Request, Response } from "express"
import { logger } from "../../logger"
import { delay } from "../../utils"

export class ErgoAggregatorSlowdownPlugin implements IPlugin {
    private delayMs: number
    private affectedPlatforms: string[]
    private pluginName: string

    constructor(delayMs: number, affectedPlatforms: string[]) {
        this.delayMs = delayMs
        this.affectedPlatforms = affectedPlatforms
        this.pluginName = "ergo_aggregator_slowdown"
    }

    /* eslint-disable-next-line @typescript-eslint/no-unused-vars */
    async run(req: Request, res: Response): Promise<void> {
        const platformName = req.params.platform
        logger.info(
            `[${this.pluginName}] is enabled, checking if platform [${platformName}] is affected`
        )
        if (this.isPlatformAffected(platformName)) {
            logger.info(
                `Platform [${platformName}] is affected, adding delay of [${this.delayMs}ms]`
            )
            await delay(this.delayMs)
        }
    }

    private isPlatformAffected(platformName: string): boolean {
        return this.affectedPlatforms.includes(platformName)
    }

    getName(): string {
        return this.pluginName
    }
}
