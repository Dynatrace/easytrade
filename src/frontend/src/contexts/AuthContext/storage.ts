import { useState, useCallback } from "react"

const SESSION_KEY = "user-id"

export function sessionStore(value: string | null) {
    const [storedValue, setStoredValue] = useState<string | null>(() => {
        try {
            return sessionStorage.getItem(SESSION_KEY) ?? value
        } catch {
            return value
        }
    })

    const setValue = useCallback(
        (
            newValue:
                | string
                | null
                | ((prev: string | null) => string | null)
        ) => {
            try {
                const next =
                    typeof newValue === "function"
                        ? newValue(storedValue)
                        : newValue
                setStoredValue(next)
                if (next === null) {
                    sessionStorage.removeItem(SESSION_KEY)
                } else {
                    sessionStorage.setItem(SESSION_KEY, next)
                }
            } catch (e) {
                console.error(e)
            }
        },
        [storedValue]
    )

    const removeValue = useCallback(() => {
        try {
            setStoredValue(null)
            sessionStorage.removeItem(SESSION_KEY)
        } catch (e) {
            console.error(e)
        }
    }, [])

    return [storedValue, setValue, removeValue] as [
        string | null,
        typeof setValue,
        typeof removeValue,
    ]
}

export function localStore(value: string | null) {
    return useState<string | null>(value)
}
