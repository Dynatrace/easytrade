import { useEffect, useState } from "react"

const MS_IN_SECOND = 1000
const MS_IN_MINUTE = 60 * MS_IN_SECOND
const MS_IN_HOUR = 60 * MS_IN_MINUTE
const MS_IN_DAY = 24 * MS_IN_HOUR

function pad(n: number): string {
    return n.toString().padStart(2, "0")
}

function formatSeconds(ms: number): string {
    return `${Math.floor(ms / MS_IN_SECOND)}s`
}

function formatMinutesSeconds(ms: number): string {
    const minutes = Math.floor(ms / MS_IN_MINUTE)
    const seconds = Math.floor((ms % MS_IN_MINUTE) / MS_IN_SECOND)
    return `${minutes}m ${pad(seconds)}s`
}

function formatHoursMinutes(ms: number): string {
    const hours = Math.floor(ms / MS_IN_HOUR)
    const minutes = Math.floor((ms % MS_IN_HOUR) / MS_IN_MINUTE)
    return `${hours}h ${pad(minutes)}m`
}

function formatDaysHours(ms: number): string {
    const days = Math.floor(ms / MS_IN_DAY)
    const hours = Math.floor((ms % MS_IN_DAY) / MS_IN_HOUR)
    return `${days}d ${hours}h`
}

export function formatElapsed(ms: number): string {
    const total = Math.max(0, ms)

    if (total < MS_IN_MINUTE) return formatSeconds(total)
    if (total < MS_IN_HOUR) return formatMinutesSeconds(total)
    if (total < MS_IN_DAY) return formatHoursMinutes(total)
    return formatDaysHours(total)
}

export function useElapsed(enabledAt?: string): string | null {
    const timestamp = enabledAt === undefined ? NaN : Date.parse(enabledAt)
    const hasTimestamp = !Number.isNaN(timestamp)

    const [now, setNow] = useState(() => Date.now())

    useEffect(() => {
        if (!hasTimestamp) return
        setNow(Date.now())
        const id = setInterval(() => setNow(Date.now()), MS_IN_SECOND)
        return () => clearInterval(id)
    }, [hasTimestamp])

    if (!hasTimestamp) return null
    return formatElapsed(now - timestamp)
}
