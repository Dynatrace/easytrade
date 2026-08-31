import * as grpc from "@grpc/grpc-js"
import { promisify } from "util"
import { PackageServiceClient, PackagesResponse } from "../proto/package_service"
import { ProductServiceClient, ProductsResponse } from "../proto/product_service"
import { Empty } from "../proto/google/protobuf/empty"
import { config } from "../config"

function createInsecureClient<T extends grpc.Client>(
    Ctor: new (
        address: string,
        credentials: grpc.ChannelCredentials,
        options?: Partial<grpc.ClientOptions>
    ) => T
): T {
    return new Ctor(
        config.dbAdapterHostAndPort,
        grpc.credentials.createInsecure()
    )
}

const packageClient = createInsecureClient(PackageServiceClient)
const productClient = createInsecureClient(ProductServiceClient)

export const getPackages = promisify(packageClient.getPackages.bind(packageClient)) as (request: Empty) => Promise<PackagesResponse>
export const getProducts = promisify(productClient.getProducts.bind(productClient)) as (request: Empty) => Promise<ProductsResponse>

export function isDbAdapterReady(): boolean {
    return packageClient.getChannel().getConnectivityState(true) === grpc.connectivityState.READY
}
