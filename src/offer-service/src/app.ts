import express, { Application } from "express"
import { logger } from "./logger"
import "./openfeature"
import { setupMiddleware } from "./middleware"
import { setupControllers } from "./controllers"

const app: Application = express()

setupMiddleware(app)
setupControllers(app)

app.listen(8080, () => {
    logger.info("App listening on port [8080]")
})
