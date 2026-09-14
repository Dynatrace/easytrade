import { Application } from "express"
import { getOffers } from "./offers"
import { signUpNewUser } from "./signups"
import { getVersion } from "./version"
import { getLivez, getReadyz } from "./health"

export function setupControllers(app: Application): void {
    app.get("/api/offers/:platform", getOffers)
    app.post("/api/signup", signUpNewUser)
    app.get("/api/version", getVersion)
    app.get("/livez", getLivez)
    app.get("/readyz", getReadyz)
}
