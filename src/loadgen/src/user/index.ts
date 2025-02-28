import { User } from "./types"
import users from "../../resources/users.json"
import { arrayRandom } from "../utils"

export { User }

export function getRandomUser(): User {
    return arrayRandom(users) as User
}
