export * from "./types"
import { getJsonWithTimeout } from "../http"
import {
    version as frontendBuildVersion,
    buildDate as frontendBuildDate,
    buildCommit as frontendBuildCommit,
} from "../../../package.json"
import {
    ServiceVersion,
    ServiceVersionData,
    ServiceVersionSuccess,
    ServiceVersionUrl,
} from "./types"

const TIMEOUT_MS = 1000

const SERVICES: ServiceVersionUrl[] = [
    { serviceName: "Broker Service", versionUrl: "/broker-service/version" },
    {
        serviceName: "Credit Card Order Service",
        versionUrl: "/credit-card-order-service/version",
    },
    {
        serviceName: "Feature Flag Service",
        versionUrl: "/feature-flag-service/version",
    },
    { serviceName: "User Service", versionUrl: "/user-service/api/version" },
    { serviceName: "Offer Service", versionUrl: "/offerservice/api/version" },
    { serviceName: "Pricing Service", versionUrl: "/pricing-service/version" },
    {
        serviceName: "Background Service",
        versionUrl: "/background-service/version",
    },
]

async function getServiceVersion({
    serviceName,
    versionUrl,
}: ServiceVersionUrl): Promise<ServiceVersion> {
    try {
        const data = await getJsonWithTimeout<ServiceVersionData>(
            versionUrl,
            TIMEOUT_MS
        )
        return { success: true, serviceName, data }
    } catch (error) {
        console.error(`[getServiceVersion] ${serviceName} failed`, error)
        return {
            success: false,
            serviceName,
            message: `${serviceName} didn't respond`,
        }
    }
}

export async function getAllVersions(): Promise<ServiceVersion[]> {
    return await Promise.all(SERVICES.map(getServiceVersion))
}

export function getFrontendVersion(): ServiceVersionSuccess {
    return {
        success: true,
        serviceName: "Frontend",
        data: {
            buildVersion: frontendBuildVersion,
            buildDate: frontendBuildDate,
            buildCommit: frontendBuildCommit,
        },
    }
}
