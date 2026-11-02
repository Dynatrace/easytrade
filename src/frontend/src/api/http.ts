export class ApiError extends Error {
    readonly status: number
    readonly url: string

    constructor(status: number, url: string) {
        super(`HTTP ${status} for ${url}`)
        this.name = "ApiError"
        this.status = status
        this.url = url
    }
}

export const services = {
    featureFlag: () => `${window.location.origin}/feature-flag-service/v1`,
    user: () => `${window.location.origin}/user-service/api`,
    broker: () => `${window.location.origin}/broker-service/v1`,
    pricing: () => `${window.location.origin}/pricing-service/v1`,
    creditCard: () => `${window.location.origin}/credit-card-order-service/v1`,
}

const JSON_HEADERS = {
    Accept: "application/json",
    "Content-Type": "application/json",
}

const XML_HEADERS = {
    Accept: "application/xml",
    "Content-Type": "application/xml",
}

async function request(
    url: string,
    init: RequestInit,
    /** Statuses to treat as a normal response rather than an error. */
    allowStatus: readonly number[] = []
): Promise<Response> {
    const response = await fetch(url, init)
    if (!response.ok && !allowStatus.includes(response.status)) {
        throw new ApiError(response.status, url)
    }
    return response
}

export async function getJson<T>(url: string): Promise<T> {
    const response = await request(url, { headers: JSON_HEADERS })
    return (await response.json()) as T
}

export async function postJson<T>(url: string, body: unknown): Promise<T> {
    const response = await request(url, {
        method: "POST",
        headers: JSON_HEADERS,
        body: JSON.stringify(body),
    })
    return (await response.json()) as T
}

/** POST for endpoints that return no body. */
export async function post(url: string, body: unknown): Promise<void> {
    await request(url, {
        method: "POST",
        headers: JSON_HEADERS,
        body: JSON.stringify(body),
    })
}

export async function put<T>(
    url: string,
    body: unknown
): Promise<T | undefined> {
    const response = await request(url, {
        method: "PUT",
        headers: JSON_HEADERS,
        body: JSON.stringify(body),
    })
    const text = await response.text()
    return text ? (JSON.parse(text) as T) : undefined
}

export async function del(url: string): Promise<void> {
    await request(url, { method: "DELETE", headers: JSON_HEADERS })
}

/** Returns the raw body so the caller can hand it to its own XML parser. */
export async function getXml(
    url: string,
    allowStatus: readonly number[] = []
): Promise<string> {
    const response = await request(url, { headers: XML_HEADERS }, allowStatus)
    return await response.text()
}

export async function getJsonWithTimeout<T>(
    url: string,
    timeoutMs: number
): Promise<T> {
    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), timeoutMs)
    try {
        const response = await request(url, {
            headers: { Accept: "application/json" },
            signal: controller.signal,
        })
        return (await response.json()) as T
    } finally {
        clearTimeout(timer)
    }
}
