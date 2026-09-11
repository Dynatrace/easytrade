import { useEffect, useState } from "react"

const MS_IN_SECOND = 1000
const MS_IN_MINUTE = 60 * MS_IN_SECOND
const MS_IN_HOUR = 60 * MS_IN_MINUTE
const MS_IN_DAY = 24 * MS_IN_HOUR

function pad(n: number): string {
    return n.toString().padStart(2, "0")
}

/**
 * Formats a duration as a compact, human readable string.
 * Seconds are only shown below one hour — that is the range where they
 * matter while waiting for a problem pattern to show up in Dynatrace.
 */
export function formatElapsed(ms: number): string {
    const total = Math.max(0, ms)

    if (total < MS_IN_MINUTE) {
        return `${Math.floor(total / MS_IN_SECOND)}s`
    }
    if (total < MS_IN_HOUR) {
        const minutes = Math.floor(total / MS_IN_MINUTE)
        const seconds = Math.floor((total % MS_IN_MINUTE) / MS_IN_SECOND)
        return `${minutes}m ${pad(seconds)}s`
    }
    if (total < MS_IN_DAY) {
        const hours = Math.floor(total / MS_IN_HOUR)
        const minutes = Math.floor((total % MS_IN_HOUR) / MS_IN_MINUTE)
        return `${hours}h ${pad(minutes)}m`
    }
    const days = Math.floor(total / MS_IN_DAY)
    const hours = Math.floor((total % MS_IN_DAY) / MS_IN_HOUR)
    return `${days}d ${hours}h`
}

/**
 * Live counter of how long ago `enabledAt` was, re-rendering once a second.
 * Returns null — and registers no interval — when there is no timestamp,
 * so disabled flags cost nothing.
 */
export function useElapsed(enabledAt?: string): string | null {
    const timestamp = enabledAt === undefined ? NaN : Date.parse(enabledAt)
    const hasTimestamp = !Number.isNaN(timestamp)

    const [now, setNow] = useState(() => Date.now())

    useEffect(() => {
        if (!hasTimestamp) return
        setNow(Date.now())
        const id = setInterval(() => setNow(Date.now()), MS_IN_SECOND)
        return () => clearInterval(id)
    }, [hasTimestamp, timestamp])

    if (!hasTimestamp) return null
    return formatElapsed(now - timestamp)
}
