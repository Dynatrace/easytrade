import type { ComponentType } from "react"

export const lazyPage = (load: () => Promise<{ default: ComponentType }>) => ({
    Component: async () => (await load()).default,
})
