import { Package, Product } from "./types"

export const packages: Package[] = [
    {
        name: "Starter",
        price: 0,
        support: ["Email"],
    },
    {
        name: "Light",
        price: 24.99,
        support: ["Email", "Hotline"],
    },
    {
        name: "Pro",
        price: 49.99,
        support: ["Email", "Hotline", "AccountManager"],
    },
]

export const products: Product[] = [
    {
        name: "Share",
        ppT: 5.9,
        currency: "EUR",
    },
    {
        name: "ETF",
        ppT: 5.9,
        currency: "EUR",
    },
    {
        name: "Crypto",
        ppT: 5.9,
        currency: "EUR",
    },
]
