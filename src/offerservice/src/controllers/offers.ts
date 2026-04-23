import { Query, ParamsDictionary, Request } from "express-serve-static-core"
import { Response } from "express"
import { logger } from "../logger"
import { urls } from "../config"
import { toXml } from "../utils"

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface TypedRequestQuery<
    P extends ParamsDictionary,
    Q extends Query,
> extends Request {
    params: P
    query: Q
}

type GetOffersRequest = TypedRequestQuery<
    { platform: string },
    { productFilter: string; maxYearlyFeeFilter: string }
>

interface Package {
    id: number
    name: string
    price: number
    support: string
}

interface Product {
    id: number
    name: string
    ppt: number
    currency: string
}

// ---------------------------------------------------------------------------
// Data fetching
// ---------------------------------------------------------------------------

async function getPackages(maxYearlyFee?: number): Promise<Package[]> {
    try {
        const url = urls.getPackages()
        logger.info(`Fetching packages from [${url}]`)
        const res = await fetch(url)
        const data: Package[] = await res.json()
        logger.debug(`Packages response: [${JSON.stringify(data)}]`)
        return maxYearlyFee === undefined
            ? data
            : data.filter((p) => p.price <= maxYearlyFee)
    } catch (err) {
        logger.warn(`Error when getting package list [${err}]`)
        return []
    }
}

async function getProducts(productNames?: string[]): Promise<Product[]> {
    try {
        const url = urls.getProducts()
        logger.info(`Fetching products from [${url}]`)
        const res = await fetch(url)
        const data: Product[] = await res.json()
        logger.debug(`Products response: [${JSON.stringify(data)}]`)
        return productNames === undefined
            ? data
            : data.filter((p) => productNames.includes(p.name))
    } catch (err) {
        logger.warn(`Error when getting product list [${err}]`)
        return []
    }
}

// ---------------------------------------------------------------------------
// Handler
// ---------------------------------------------------------------------------

export async function getOffers(
    req: GetOffersRequest,
    res: Response
): Promise<void> {
    const platform = req.params.platform
    const maxYearlyFee =
        req.query.maxYearlyFeeFilter === undefined
            ? undefined
            : Number(req.query.maxYearlyFeeFilter)
    const productNames: string[] | undefined =
        req.query.productFilter === undefined
            ? undefined
            : JSON.parse(req.query.productFilter)

    logger.info(`Preparing offer response for [${platform}]`)
    const [packages, products] = await Promise.all([
        getPackages(maxYearlyFee),
        getProducts(productNames),
    ])

    const data = {
        platform: "EasyTrade",
        quoteFor: platform,
        packages,
        products,
    }

    const xmlMimeTypes = ["application/xml", "text/xml"]
    const acceptHeader = req.header("Accept")

    if (acceptHeader !== undefined && xmlMimeTypes.includes(acceptHeader)) {
        res.status(200).contentType(xmlMimeTypes[0]).send(toXml("offer", data))
    } else {
        res.status(200).json(data)
    }
}
