import { Request, Response } from "express"
import { version } from "./const"
import { Version } from "./types"

function getVersionString({
    buildVersion,
    buildDate,
    buildCommit,
}: Version): string {
    return `EasyTrade Offer Service Version: ${buildVersion}\n\nBuild date: ${buildDate}, git commit: ${buildCommit}`
}

function getVersionJson(version: Version): string {
    return JSON.stringify(version)
}

export async function getVersion(req: Request, res: Response): Promise<void> {
    switch (req.header("Accept")) {
        case "application/json":
            res.type("json").send(getVersionJson(version))
            break
        default:
            res.type("txt").send(getVersionString(version))
    }
}
