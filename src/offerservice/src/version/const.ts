import {
    version as buildVersion,
    buildDate,
    buildCommit,
} from "../../package.json"
import { Version } from "./types"

export const version: Version = {
    buildVersion,
    buildDate,
    buildCommit,
}
