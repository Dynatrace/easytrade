import type { ComponentType } from "react"

export function lazyPage(load: () => Promise<{ default: ComponentType }>) {
    return {
        async Component() {
            return (await load()).default
        },
    }
}
