import { Request, Response } from "express"
import {
    version as buildVersion,
    buildDate,
    buildCommit,
} from "../../package.json"

interface Version {
    buildVersion: string
    buildDate: string
    buildCommit: string
}

const version: Version = { buildVersion, buildDate, buildCommit }

function getVersionString({ buildVersion, buildDate, buildCommit }: Version): string {
    return `EasyTrade Offer Service Version: ${buildVersion}\n\nBuild date: ${buildDate}, git commit: ${buildCommit}`
}

export async function getVersion(req: Request, res: Response): Promise<void> {
    switch (req.header("Accept")) {
        case "application/json":
            res.type("json").send(JSON.stringify(version))
            break
        default:
            res.type("txt").send(getVersionString(version))
    }
}
