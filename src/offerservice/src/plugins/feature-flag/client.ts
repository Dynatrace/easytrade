import { FeatureFlag } from "./types"
import { FeatureFlagServiceUrls } from "../../urls/urls"
import { logger } from "../../logger"
import axios from "axios"

export class FeatureFlagClient {
    private featureFlagServiceUrl: URL

    constructor() {
        this.featureFlagServiceUrl = FeatureFlagServiceUrls.getFlagsUrl()
    }

    async getFlag(flagId: string): Promise<FeatureFlag | undefined> {
        try {
            const requestURL =
                this.featureFlagServiceUrl.toString() + "/" + flagId
            logger.info(`Sending request to [${requestURL}]`)
            const res = await axios.get(requestURL)
            return res.data
        } catch (err) {
            logger.warn(`Error when getting feature flag [${err}]`)
            return
        }
    }
}
