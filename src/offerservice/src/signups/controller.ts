import { Request, Response } from "express"
import { logger } from "../logger"
import { LoginServiceUrls } from "../urls/urls"
import axios, { isAxiosError } from "axios"

export async function signUpNewUser(
    req: Request,
    response: Response
): Promise<void> {
    try {
        const url = LoginServiceUrls.getCreateNewUserUrl()
        logger.info(
            `Sending signup request for [${JSON.stringify(
                req.body
            )}] to [${url.toString()}]`
        )
        const res = await axios.post(url.toString(), req.body)
        logger.info(`User signup response [${JSON.stringify(res)}]`)
        response.status(201).json(res.data)
    } catch (err) {
        if (isAxiosError(err)) {
            logger.error(
                `Error when trying to signup user [${err.response?.status} | ${err.response?.statusText}]`
            )
            response
                .status(err.response?.status ?? 500)
                .json(
                    err.response?.data ??
                        `Unexpected server side error [${err}]`
                )
            return
        }
        logger.error(`Unexpected error when trying to singup user [${err}]`)
        response
            .status(500)
            .json(`Unexpected error when trying to singup user [${err}]`)
    }
}
