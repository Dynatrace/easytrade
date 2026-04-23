import express, { Application } from "express"
import { logger } from "./logger"
import { config } from "./config"
import "./openfeature"
import { setupMiddleware } from "./middleware"
import { setupControllers } from "./controllers"

const app: Application = express()

setupMiddleware(app)
setupControllers(app)

app.listen(config.appPort, () => {
    logger.info(`App listening on port [${config.appPort}]`)
})
