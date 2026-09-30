import { QueryClient } from "@tanstack/react-query"

export const userKeys = {
    all: ["users"] as const,
    preset: ["users", "preset"] as const,
    current: ["users", "current"] as const,
    byId: (userId: string) => ["users", "current", userId] as const,
}

export const balanceKeys = {
    current: ["balance"] as const,
    byId: (userId: string) => ["balance", userId] as const,
}

export const transactionKeys = {
    all: ["transactions"] as const,
    byUser: (userId: string) => ["transactions", userId] as const,
}

export const instrumentKeys = {
    all: ["instruments"] as const,
    byUser: (accountId?: string) =>
        ["instruments", accountId ?? "anonymous"] as const,
}

export const priceKeys = {
    all: ["prices"] as const,
    byInstrument: (instrumentId: string) =>
        ["prices", instrumentId.toString()] as const,
}

export const creditCardKeys = {
    all: ["credit-card"] as const,
    status: ["credit-card", "status"] as const,
    history: ["credit-card", "status", "history"] as const,
}

export const featureFlagKeys = {
    all: ["feature-flags"] as const,
    problemPatterns: ["feature-flags", "problem-patterns"] as const,
    config: ["feature-flags", "config"] as const,
}

export const portfolioKeys = {
    all: ["portfolio"] as const,
    history: (accountId: string) =>
        ["portfolio", "history", accountId] as const,
}

export const versionKeys = {
    all: ["versions"] as const,
}

export async function invalidateBalance(client: QueryClient) {
    await client.invalidateQueries({ queryKey: balanceKeys.current })
    await client.invalidateQueries({ queryKey: portfolioKeys.all })
}

export async function invalidateTransactions(client: QueryClient) {
    await client.invalidateQueries({ queryKey: transactionKeys.all })
}

export async function invalidateQuickTransaction(client: QueryClient) {
    await client.invalidateQueries({ queryKey: balanceKeys.current })
    await client.invalidateQueries({ queryKey: instrumentKeys.all })
    await client.invalidateQueries({ queryKey: transactionKeys.all })
    await client.invalidateQueries({ queryKey: portfolioKeys.all })
}

export async function invalidateCreditCardStatus(client: QueryClient) {
    await client.invalidateQueries({ queryKey: creditCardKeys.status })
}

export function invalidateOnLogout(client: QueryClient) {
    client.removeQueries({ queryKey: transactionKeys.all })
    client.removeQueries({ queryKey: instrumentKeys.all })
    client.removeQueries({ queryKey: userKeys.current })
    client.removeQueries({ queryKey: balanceKeys.current })
    client.removeQueries({ queryKey: creditCardKeys.all })
    client.removeQueries({ queryKey: portfolioKeys.all })
}
