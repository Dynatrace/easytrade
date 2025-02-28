import { useState } from "react"
import { useSessionStorage } from "usehooks-ts"

export function sessionStore(value: string | null) {
    return useSessionStorage("user-id", value)
}

export function localStore(value: string | null) {
    return useState<string | null>(value)
}
