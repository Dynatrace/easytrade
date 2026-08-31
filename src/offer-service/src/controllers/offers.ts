import { ParamsDictionary, Request } from "express-serve-static-core"
import { Response } from "express"
import { logger } from "../logger"
import { toXml } from "../utils"
import { getPackages, getProducts } from "../services/db-adapter"
import { PackageMessage } from "../proto/package_service"
import { ProductMessage } from "../proto/product_service"
import { Empty } from "../proto/google/protobuf/empty"

type GetOffersRequest = Request<
    ParamsDictionary & { platform: string },
    unknown,
    never,
    { productFilter?: string; maxYearlyFeeFilter?: string }
>

type OfferFilters = {
    maxYearlyFee: number | undefined
    productNames: string[] | undefined
}

type OfferData = {
    platform: string
    quoteFor: string
    packages: PackageMessage[]
    products: ProductMessage[]
}

const XML_MIME_TYPES = ["application/xml", "text/xml"] as const

export async function getOffers(
    req: GetOffersRequest,
    res: Response
): Promise<void> {
    const { platform } = req.params
    const filters = parseFilters(req.query)

    logger.info(`Preparing offer response for [${platform}]`)

    let packages: PackageMessage[]
    let products: ProductMessage[]

    try {
        [{ packages }, { products }] = await Promise.all([
            getPackages(Empty.create()),
            getProducts(Empty.create()),
        ])
    } catch (err) {
        logger.error(`Error fetching data from db-adapter`, err)
        res.status(502).json(`Error fetching data from db-adapter [${err}]`)
        return
    }

    const data: OfferData = {
        platform: "EasyTrade",
        quoteFor: platform,
        packages: filterPackagesByMaxFee(packages, filters.maxYearlyFee),
        products: filterProductsByName(products, filters.productNames),
    }

    sendOfferResponse(req, res, data)
}

function sendOfferResponse(
    req: GetOffersRequest,
    res: Response,
    data: OfferData
): void {
    if (isXmlRequest(req)) {
        res.status(200).contentType(XML_MIME_TYPES[0]).send(toXml("offer", data))
    } else {
        res.status(200).json(data)
    }
}


function parseFilters(query: GetOffersRequest["query"]): OfferFilters {
    return {
        maxYearlyFee:
            query.maxYearlyFeeFilter !== undefined
                ? Number(query.maxYearlyFeeFilter)
                : undefined,
        productNames:
            query.productFilter !== undefined
                ? (JSON.parse(query.productFilter) as string[])
                : undefined,
    }
}

function filterPackagesByMaxFee(
    packages: PackageMessage[],
    maxYearlyFee: number | undefined
): PackageMessage[] {
    if (maxYearlyFee === undefined) return packages
    return packages.filter((pkg) => pkg.price <= maxYearlyFee)
}

function filterProductsByName(
    products: ProductMessage[],
    productNames: string[] | undefined
): ProductMessage[] {
    if (productNames === undefined) return products
    return products.filter((product) => productNames.includes(product.name))
}

function isXmlRequest(req: GetOffersRequest): boolean {
    const acceptHeader = req.header("Accept")
    return (
        acceptHeader !== undefined &&
        (XML_MIME_TYPES as readonly string[]).includes(acceptHeader)
    )
}
