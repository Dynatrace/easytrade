import { Request, Response } from "express"
import { isDbAdapterReady } from "../services/db-adapter"

export async function getLivez(req: Request, res: Response): Promise<void> {
    res.status(200).type("txt").send("OK")
}

export async function getReadyz(req: Request, res: Response): Promise<void> {
    if (isDbAdapterReady()) {
        res.status(200).type("txt").send("OK")
        return
    }
    res.status(503).type("txt").send("Service Unavailable")
}
