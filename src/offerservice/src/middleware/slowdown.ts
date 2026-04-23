import { NextFunction, Request, Response } from "express"
import { logger } from "../logger"
import { sampleArray, delay } from "../utils"
import {
    PLATFORMS,
    SLOWDOWN_AFFECTED_PLATFORM_COUNT,
    SLOWDOWN_DELAY_MS,
} from "../config"
import { openFeatureClient } from "../openfeature"

const PLUGIN_NAME = "ergo_aggregator_slowdown"

export async function slowdownMiddleware(
    req: Request<{ platform: string }>,
    res: Response,
    next: NextFunction
): Promise<void> {
    const enabled = await openFeatureClient.getBooleanValue(PLUGIN_NAME, false)

    if (enabled) {
        if (!slowdownState.isActive) {
            slowdownState.activate()
            logger.info(
                `Plugin [${PLUGIN_NAME}] activated, affected platforms: [${slowdownState.affectedPlatforms.join(", ")}]`
            )
        }

        const platform = req.params.platform
        logger.info(`Plugin [${PLUGIN_NAME}] enabled, checking platform...`)
        if (slowdownState.isAffected(platform)) {
            logger.info(
                `Platform [${platform}] is affected, adding delay of [${SLOWDOWN_DELAY_MS}ms]`
            )
            await delay(SLOWDOWN_DELAY_MS)
        }
    } else {
        if (slowdownState.isActive) {
            slowdownState.deactivate()
            logger.info(
                `Plugin [${PLUGIN_NAME}] deactivated, clearing affected platforms`
            )
        }
        logger.info(`Plugin [${PLUGIN_NAME}] disabled, skipping...`)
    }

    next()
}

class SlowdownState {
    private _isActive = false
    private _affectedPlatforms: string[] = []

    constructor(
        private readonly platforms: string[],
        private readonly affectedCount: number
    ) {}

    get isActive(): boolean {
        return this._isActive
    }

    get affectedPlatforms(): string[] {
        return [...this._affectedPlatforms]
    }

    activate(): void {
        this._affectedPlatforms = sampleArray(
            this.platforms,
            this.affectedCount
        )
        this._isActive = true
    }

    deactivate(): void {
        this._affectedPlatforms = []
        this._isActive = false
    }

    isAffected(platform: string): boolean {
        return this._affectedPlatforms.includes(platform)
    }
}

const slowdownState = new SlowdownState(
    PLATFORMS,
    SLOWDOWN_AFFECTED_PLATFORM_COUNT
)
