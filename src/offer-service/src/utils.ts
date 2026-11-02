export const delay = (ms: number) =>
    new Promise((resolve) => setTimeout(resolve, ms))

export function sampleArray<T>(array: T[], size: number): T[] {
    const result = [...array]
    for (let i = result.length - 1; i >= 1; i--) {
        const j = Math.floor(Math.random() * (i + 1))
        const tmp = result[j]
        result[j] = result[i]
        result[i] = tmp
    }
    result.length = size
    return result
}

export function toXml(tag: string, value: unknown): string {
    if (Array.isArray(value)) {
        return value.map((item) => toXml(tag, item)).join("")
    }
    if (value !== null && typeof value === "object") {
        const inner = Object.entries(value as Record<string, unknown>)
            .map(([k, v]) => toXml(k, v))
            .join("")
        return `<${tag}>${inner}</${tag}>`
    }
    return `<${tag}>${value}</${tag}>`
}
