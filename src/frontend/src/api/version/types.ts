export type ServiceVersionUrl = {
    serviceName: string
    versionUrl: string
}

export type ServiceVersionData = {
    buildVersion: string
    buildDate: string
    buildCommit: string
}

export type ServiceVersionSuccess = {
    success: true
    serviceName: string
    data: ServiceVersionData
}

export type ServiceVersionError = {
    success: false
    serviceName: string
    message: string
}

export type ServiceVersion = ServiceVersionSuccess | ServiceVersionError
