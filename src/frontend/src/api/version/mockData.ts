import { ServiceVersion } from "./types"

export const VERSIONS: ServiceVersion[] = [
    {
        success: true,
        serviceName: "Broker Service",
        data: {
            buildVersion: "Mock Broker Service version",
            buildDate: "Date",
            buildCommit: "Commit",
        },
    },
    {
        success: true,
        serviceName: "Login Service",
        data: {
            buildVersion: "Mock Login Service version",
            buildDate: "Date",
            buildCommit: "Commit",
        },
    },
    {
        success: true,
        serviceName: "Pricing Service",
        data: {
            buildVersion: "Mock Pricing Service version",
            buildDate: "Date",
            buildCommit: "Commit",
        },
    },
]
