import { Response } from "express"
import { logger } from "../logger"
import { GetOffersRequest, PackageProvider, ProductProvider } from "./types"
import { XMLBuilder } from "fast-xml-parser"

async function getOffers(
    packageProvider: PackageProvider,
    productProvider: ProductProvider,
    req: GetOffersRequest,
    res: Response
): Promise<void> {
    const platform = req.params.platform
    const productFilter = req.query.productFilter
    const maxYearlyFeeFilter =
        req.query.maxYearlyFeeFilter === undefined
            ? undefined
            : Number(req.query.maxYearlyFeeFilter)
    const parsedProductFilter: string[] =
        productFilter === undefined ? undefined : JSON.parse(productFilter)

    logger.info(`Preparing offer response for [${platform}]`)
    const [packageResult, productResult] = await Promise.all([
        packageProvider.getPackages({ maxYearlyFee: maxYearlyFeeFilter }),
        productProvider.getProducts({ productNames: parsedProductFilter }),
    ])
    logger.info(
        `Got packages for [${platform}], [${JSON.stringify(packageResult)}]`
    )
    logger.info(
        `Got products for [${platform}], [${JSON.stringify(packageResult)}]`
    )

    const data = {
        platform: "EasyTrade",
        quoteFor: platform,
        packages: packageResult,
        products: productResult,
    }

    const xmlMimeTypes = ["application/xml", "text/xml"]
    const acceptHeader = req.header("Accept")

    if (acceptHeader !== undefined && xmlMimeTypes.includes(acceptHeader)) {
        const builder = new XMLBuilder()
        const xmlBody = builder.build({ offer: data })
        res.status(200).contentType(xmlMimeTypes[0]).send(xmlBody)
    } else {
        res.status(200).json(data)
    }
}

export function getOffersGetController(
    packageProvider: PackageProvider,
    productProvider: ProductProvider
) {
    return async function (
        req: GetOffersRequest,
        res: Response
    ): Promise<void> {
        return getOffers(packageProvider, productProvider, req, res)
    }
}
