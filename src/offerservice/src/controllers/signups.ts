import { Request, Response } from "express"
import { logger } from "../logger"
import { urls } from "../config"

export async function signUpNewUser(
    req: Request,
    res: Response
): Promise<void> {
    try {
        const url = urls.createAccount()
        logger.info(
            `Sending signup request for [${JSON.stringify(req.body)}] to [${url}]`
        )
        const upstream = await fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(req.body),
        })

        if (!upstream.ok) {
            const text = await upstream.text()
            logger.error(
                `Error when trying to signup user [${upstream.status} | ${upstream.statusText}]: ${text}`
            )
            res.status(upstream.status).send(text)
            return
        }

        const data = await upstream.json()
        logger.info(`User signup response [${JSON.stringify(data)}]`)
        res.status(201).json(data)
    } catch (err) {
        logger.error(`Unexpected error when trying to signup user [${err}]`)
        res.status(500).json(
            `Unexpected error when trying to signup user [${err}]`
        )
    }
}
