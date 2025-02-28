import express, { Application, Response, Request, NextFunction } from "express"
import { urlencoded, json } from "body-parser"
import { registerRoutes } from "./routes/routes"
import { logger } from "./logger"
import { envManager } from "./env/envManager"
import { setupPlugins } from "./plugins/plugin"
import { ENV_VAR_NAMES } from "./env/const"

logger.info("Checking env vars")
envManager.checkEnvVars()

// deepcode ignore UseCsurfForExpress: not required, deepcode ignore UseHelmetForExpress: not required
const app: Application = express()

logger.info("Adding standard middleware")
app.use(urlencoded({ extended: false })) // x-www-form-urlencoded <form>
app.use(json()) // application/json
app.use((req: Request, res: Response, next: NextFunction) => {
    res.setHeader("Access-Control-Allow-Origin", "*")
    res.setHeader(
        "Access-Control-Allow-Methods",
        "OPTIONS, GET, POST, PUT, PATCH, DELETE"
    )
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization")
    next()
})
app.disable("x-powered-by") // Disable X-Powered-By header

logger.info("Adding logging to requests")
app.use((req: Request, res: Response, next: NextFunction) => {
    logger.info(
        `Got [${req.method}] request to [${req.baseUrl}${
            req.path
        }] with query [${JSON.stringify(req.query)}] and body [${JSON.stringify(
            req.body
        )}]`
    )
    next()
})

logger.info("Initializing plugins")
setupPlugins(app)

logger.info("Registering routes")
registerRoutes(app)

const port = parseInt(envManager.getEnv(ENV_VAR_NAMES.APP_PORT))
app.listen(port, () => {
    logger.info(`App listening on port [${port}]`)
})
