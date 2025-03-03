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
