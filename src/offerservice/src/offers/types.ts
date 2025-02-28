import { Query, ParamsDictionary } from "express-serve-static-core"
import { Request } from "express"

export interface TypedRequestQuery<P extends ParamsDictionary, Q extends Query>
    extends Request {
    params: P
    query: Q
}

export type GetOffersRequest = TypedRequestQuery<
    { platform: string },
    { productFilter: string; maxYearlyFeeFilter: string }
>

export interface Package {
    name: string
    price: number
    support: string[]
}

export interface Product {
    name: string
    ppT: number
    currency: string
}

export interface PackageFilter {
    maxYearlyFee?: number
}

export interface ProductFilter {
    productNames?: string[]
}

export interface PackageProvider {
    getPackages(filter?: PackageFilter): Promise<Package[]>
}

export interface ProductProvider {
    getProducts(filter?: ProductFilter): Promise<Product[]>
}
