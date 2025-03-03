import { backends } from "../backend"
import {
    ServiceVersion,
    ServiceVersionSuccess,
    ServiceVersionUrl,
} from "./types"
import {
    version as frontendBuildVersion,
    buildDate as frontendBuildDate,
    buildCommit as frontendBuildCommit,
} from "../../../package.json"
import { isAxiosError } from "axios"

const services: ServiceVersionUrl[] = [
    {
        serviceName: "Account Service",
        versionUrl: "/accountservice/api/version",
    },
    { serviceName: "Broker Service", versionUrl: "/broker-service/version" },
    {
        serviceName: "Credit Card Order Service",
        versionUrl: "/credit-card-order-service/version",
    },
    { serviceName: "Engine", versionUrl: "/engine/api/version" },
    {
        serviceName: "Feature Flag Service",
        versionUrl: "/feature-flag-service/version",
    },
    { serviceName: "Login Service", versionUrl: "/loginservice/api/version" },
    { serviceName: "Manager", versionUrl: "/manager/api/version" },
    { serviceName: "Offer Service", versionUrl: "/offerservice/api/version" },
    { serviceName: "Pricing Service", versionUrl: "/pricing-service/version" },
    {
        serviceName: "Third Party Service",
        versionUrl: "/third-party-service/version",
    },
]

export async function getAllVersions(): Promise<ServiceVersion[]> {
    console.log("[getAllVersions] Getting all services versions")
    return await Promise.all(services.map(getServiceVersion))
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

async function getServiceVersion(
    serviceVersionUrl: ServiceVersionUrl
): Promise<ServiceVersion> {
    try {
        const { data } = await backends.versions.getVersion(
            serviceVersionUrl.versionUrl
        )
        return {
            success: true,
            serviceName: serviceVersionUrl.serviceName,
            data: data,
        }
    } catch (error) {
        console.log("error: ", isAxiosError(error) ? error.message : error)
        return {
            success: false,
            serviceName: serviceVersionUrl.serviceName,
            message: `${serviceVersionUrl.serviceName} didn't respond`,
        }
    }
}
