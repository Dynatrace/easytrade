import axios, { AxiosInstance } from "axios"
import { XMLBuilder, XMLParser } from "fast-xml-parser"

export type PresetUser = {
    id: number
    username: string
    firstName: string
    lastName: string
}

type PresetUsersResponse = {
    results: PresetUser[]
}

export type UserResponse = {
    id: number
    packageId: number
    firstName: string
    lastName: string
    username: string
    email: string
    hashedPassword: string
    origin: string
    creationDate: string
    packageActivationDate: string
    accountActive: boolean
    address: string
}

export type BalanceResponse = {
    accountId: number
    value: number
}

export type LoginResponse = {
    id?: string
    error?: string
}

export type LogoutResponse = {
    message?: string
    error?: string
}

type SignupRequest = {
    packageId: number
    origin: string
    firstName: string
    lastName: string
    username: string
    email: string
    password: string
    address: string
}

type SignupResponse = {
    id?: string
    error?: string
}

export type IdResponse<T> = {
    IdResponse: T
}

export type MessageResponse<T> = {
    MessageResponse: T
}

export class UserBackend {
    private readonly accountAgent: AxiosInstance
    private readonly loginAgent: AxiosInstance
    private readonly brokerAgent: AxiosInstance

    constructor(
        accountServiceUrl: string,
        loginServiceUrl: string,
        brokerServiceUrl: string
    ) {
        this.accountAgent = axios.create({
            baseURL: accountServiceUrl,
            headers: {
                Accept: "application/json",
            },
        })
        this.loginAgent = axios.create({
            baseURL: loginServiceUrl,
            headers: {
                "Content-Type": "application/xml",
                Accept: "application/xml",
            },
        })
        this.brokerAgent = axios.create({
            baseURL: brokerServiceUrl,
            headers: {
                Accept: "application/json",
            },
        })
    }

    async loginXml(
        xmlBuilder: XMLBuilder,
        xmlParser: XMLParser,
        username: string,
        password: string
    ) {
        const response = await this.loginAgent.post(
            "/Login",
            xmlBuilder.build({ LoginRequest: { username, password } })
        )
        return xmlParser.parse(response.data) as IdResponse<LoginResponse>
    }

    async logoutXml(
        xmlBuilder: XMLBuilder,
        xmlParser: XMLParser,
        accountId: number
    ) {
        const response = await this.loginAgent.post(
            "/Logout",
            xmlBuilder.build({ LogoutRequest: { accountId } })
        )
        return xmlParser.parse(response.data) as MessageResponse<LogoutResponse>
    }

    async signupXml(
        xmlBuilder: XMLBuilder,
        xmlParser: XMLParser,
        request: SignupRequest
    ) {
        const response = await this.loginAgent.post(
            "/Signup",
            xmlBuilder.build({ SignupRequest: request })
        )
        return xmlParser.parse(response.data) as IdResponse<SignupResponse>
    }

    getData(accountId: string) {
        return this.accountAgent.get<UserResponse>(`/accounts/${accountId}`)
    }

    getBalance(accountId: string) {
        return this.brokerAgent.get<BalanceResponse>(`/balance/${accountId}`)
    }

    getPreset() {
        return this.accountAgent.get<PresetUsersResponse>("/accounts/presets")
    }
}
