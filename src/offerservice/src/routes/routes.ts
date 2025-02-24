import { Application } from "express"
import { getOffersGetController } from "../offers/controller"
import {
    EasyTradePackageProvider,
    EasyTradeProductProvider,
} from "../offers/providers"
import { signUpNewUser } from "../signups/controller"
import { OFFERS_ENDPOINTS, SIGNUP_ENDPOINTS, VERSION_ENDPOINTS } from "./const"
import { getVersion } from "../version/controller"

function registerOffersRoutes(app: Application): void {
    app.get(
        OFFERS_ENDPOINTS.GET_OFFERS,
        getOffersGetController(
            new EasyTradePackageProvider(),
            new EasyTradeProductProvider()
        )
    )
}

function registerSignupRoutes(app: Application): void {
    app.post(SIGNUP_ENDPOINTS.NEW_USER, signUpNewUser)
}

function registerVersionRoutes(app: Application): void {
    app.get(VERSION_ENDPOINTS.GET_VERSION, getVersion)
}

export function registerRoutes(app: Application): void {
    registerOffersRoutes(app)
    registerSignupRoutes(app)
    registerVersionRoutes(app)
}
