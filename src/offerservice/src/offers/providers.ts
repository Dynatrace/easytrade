import { logger } from "../logger"
import { ManagerUrls } from "../urls/urls"
import { packages, products } from "./const"
import {
    Package,
    PackageProvider,
    Product,
    ProductProvider,
    PackageFilter,
    ProductFilter,
} from "./types"
import axios from "axios"

function filterPackages(packages: Package[], filter: PackageFilter): Package[] {
    const maxYearlyFee = filter.maxYearlyFee
    if (maxYearlyFee !== undefined) {
        packages = packages.filter((p) => p.price <= maxYearlyFee)
    }
    return packages
}

function filterProducts(products: Product[], filter: ProductFilter): Product[] {
    const productNames = filter.productNames
    if (productNames !== undefined) {
        products = products.filter((p) => productNames.includes(p.name))
    }
    return products
}

export class StaticPackageProvider implements PackageProvider {
    async getPackages(filter?: { maxYearlyFee?: number }): Promise<Package[]> {
        logger.info(
            `Getting static packages with filter [${JSON.stringify(filter)}]`
        )
        return filter === undefined
            ? packages
            : filterPackages(packages, filter)
    }
}

export class StaticProductProvider implements ProductProvider {
    async getProducts(filter?: ProductFilter): Promise<Product[]> {
        logger.info(
            `Getting static products with filter [${JSON.stringify(filter)}]`
        )
        return filter === undefined
            ? products
            : filterProducts(products, filter)
    }
}

export class EasyTradePackageProvider implements PackageProvider {
    async getPackages(filter?: PackageFilter): Promise<Package[]> {
        logger.info(
            `Getting packages from EasyTrade with filter [${JSON.stringify(
                filter
            )}]`
        )
        try {
            const url = ManagerUrls.getPackagesUrl()
            logger.info(`Sending request to [${url.toString()}]`)
            const res = await axios.get(url.toString())
            logger.debug(`Response: [${JSON.stringify(res.data)}]`)
            return filter === undefined
                ? res.data
                : filterPackages(res.data, filter)
        } catch (err) {
            logger.warn(`Error when getting package list [${err}]`)
            return []
        }
    }
}

export class EasyTradeProductProvider implements ProductProvider {
    async getProducts(filter?: ProductFilter): Promise<Product[]> {
        logger.info(
            `Getting products from EasyTrade with filter [${JSON.stringify(
                filter
            )}]`
        )
        try {
            const url = ManagerUrls.getProductsUrl()
            logger.info(`Sending request to [${url.toString()}]`)
            const res = await axios.get(url.toString())
            logger.debug(`Response: [${JSON.stringify(res.data)}]`)
            return filter === undefined
                ? res.data
                : filterProducts(res.data, filter)
        } catch (err) {
            logger.warn(`Error when getting product list [${err}]`)
            return []
        }
    }
}
