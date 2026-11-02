import express, { Application, Request, Response, NextFunction } from "express"
import { logger } from "../logger"
import { slowdownMiddleware } from "./slowdown"

// deepcode ignore UseCsurfForExpress: not required, deepcode ignore UseHelmetForExpress: not required
export function setupMiddleware(app: Application): void {
    app.use(express.urlencoded({ extended: false })) // x-www-form-urlencoded <form>
    app.use(express.json()) // application/json
    app.use(corsMiddleware)
    app.disable("x-powered-by") // Disable X-Powered-By header
    app.use(requestLoggingMiddleware)
    app.use("/api/offers/:platform", slowdownMiddleware)
}

function corsMiddleware(req: Request, res: Response, next: NextFunction): void {
    res.setHeader("Access-Control-Allow-Origin", "*")
    res.setHeader(
        "Access-Control-Allow-Methods",
        "OPTIONS, GET, POST, PUT, PATCH, DELETE"
    )
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization")
    next()
}

function requestLoggingMiddleware(
    req: Request,
    res: Response,
    next: NextFunction
): void {
    logger.info(
        `Got [${req.method}] request to [${req.baseUrl}${
            req.path
        }] with query [${JSON.stringify(req.query)}] and body [${JSON.stringify(
            req.body
        )}]`
    )
    next()
}
