export type User = {
    id: string
    firstName: string
    lastName: string
    packageType: string
    email: string
    address: string
}

export type Balance = {
    accountId: string
    value: number
}

export type PresetUser = {
    id: string
    firstName: string
    lastName: string
}

export type LoginResponse = {
    id?: string
    error?: string
}

export type LoginHandler = (
    login: string,
    password: string
) => Promise<LoginResponse>

export type SignupRequest = {
    firstName: string
    lastName: string
    login: string
    email: string
    address: string
    password: string
}

export type SignupResponse = {
    id?: string
    error?: string
}

export type SignupHandler = (request: SignupRequest) => Promise<SignupResponse>
