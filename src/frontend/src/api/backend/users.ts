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
    private readonly accountServiceUrl: string
    private readonly loginServiceUrl: string
    private readonly brokerServiceUrl: string

    constructor(
        accountServiceUrl: string,
        loginServiceUrl: string,
        brokerServiceUrl: string
    ) {
        this.accountServiceUrl = accountServiceUrl
        this.loginServiceUrl = loginServiceUrl
        this.brokerServiceUrl = brokerServiceUrl
    }

    async loginXml(
        xmlBuilder: XMLBuilder,
        xmlParser: XMLParser,
        username: string,
        password: string
    ): Promise<IdResponse<LoginResponse>> {
        const response = await fetch(`${this.loginServiceUrl}/Login`, {
            method: "POST",
            headers: {
                "Content-Type": "application/xml",
                Accept: "application/xml",
            },
            body: xmlBuilder.build({ LoginRequest: { username, password } }),
        })
        if (!response.ok) throw new Error(`HTTP ${response.status}`)
        return xmlParser.parse(await response.text()) as IdResponse<LoginResponse>
    }

    async logoutXml(
        xmlBuilder: XMLBuilder,
        xmlParser: XMLParser,
        accountId: number
    ): Promise<MessageResponse<LogoutResponse>> {
        const response = await fetch(`${this.loginServiceUrl}/Logout`, {
            method: "POST",
            headers: {
                "Content-Type": "application/xml",
                Accept: "application/xml",
            },
            body: xmlBuilder.build({ LogoutRequest: { accountId } }),
        })
        if (!response.ok) throw new Error(`HTTP ${response.status}`)
        return xmlParser.parse(
            await response.text()
        ) as MessageResponse<LogoutResponse>
    }

    async signupXml(
        xmlBuilder: XMLBuilder,
        xmlParser: XMLParser,
        request: SignupRequest
    ): Promise<IdResponse<SignupResponse>> {
        const response = await fetch(`${this.loginServiceUrl}/Signup`, {
            method: "POST",
            headers: {
                "Content-Type": "application/xml",
                Accept: "application/xml",
            },
            body: xmlBuilder.build({ SignupRequest: request }),
        })
        if (!response.ok) throw new Error(`HTTP ${response.status}`)
        return xmlParser.parse(
            await response.text()
        ) as IdResponse<SignupResponse>
    }

    async getData(accountId: string): Promise<UserResponse> {
        const response = await fetch(
            `${this.accountServiceUrl}/accounts/${accountId}`,
            { headers: { Accept: "application/json" } }
        )
        if (!response.ok) throw new Error(`HTTP ${response.status}`)
        return response.json() as Promise<UserResponse>
    }

    async getBalance(accountId: string): Promise<BalanceResponse> {
        const response = await fetch(
            `${this.brokerServiceUrl}/balance/${accountId}`,
            { headers: { Accept: "application/json" } }
        )
        if (!response.ok) throw new Error(`HTTP ${response.status}`)
        return response.json() as Promise<BalanceResponse>
    }

    async getPreset(): Promise<PresetUsersResponse> {
        const response = await fetch(
            `${this.accountServiceUrl}/accounts/presets`,
            { headers: { Accept: "application/json" } }
        )
        if (!response.ok) throw new Error(`HTTP ${response.status}`)
        return response.json() as Promise<PresetUsersResponse>
    }
}
