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

export class UserBackend {
    private readonly userServiceUrl: string
    private readonly brokerServiceUrl: string

    constructor(userServiceUrl: string, brokerServiceUrl: string) {
        this.userServiceUrl = userServiceUrl
        this.brokerServiceUrl = brokerServiceUrl
    }

    async login(username: string, password: string): Promise<LoginResponse> {
        const response = await fetch(`${this.userServiceUrl}/auth/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username, password }),
        })
        if (!response.ok) return { error: "Login or password invalid" }
        return response.json() as Promise<LoginResponse>
    }

    async signup(request: SignupRequest): Promise<SignupResponse> {
        const response = await fetch(`${this.userServiceUrl}/auth/signup`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(request),
        })
        if (!response.ok) return { error: "There was an error processing the signup request." }
        return response.json() as Promise<SignupResponse>
    }

    async getData(accountId: string): Promise<UserResponse> {
        const response = await fetch(
            `${this.userServiceUrl}/accounts/${accountId}`,
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
            `${this.userServiceUrl}/accounts/presets`,
            { headers: { Accept: "application/json" } }
        )
        if (!response.ok) throw new Error(`HTTP ${response.status}`)
        return response.json() as Promise<PresetUsersResponse>
    }
}
