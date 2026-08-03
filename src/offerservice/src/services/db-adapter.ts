import * as grpc from "@grpc/grpc-js"
import { PackageServiceClient } from "../proto/package_service"
import { ProductServiceClient } from "../proto/product_service"
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

export const packageClient: PackageServiceClient =createInsecureClient(PackageServiceClient)
export const productClient: ProductServiceClient = createInsecureClient(ProductServiceClient)
