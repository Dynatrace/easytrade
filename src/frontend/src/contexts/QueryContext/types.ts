import {
    QueryFunction,
    UseQueryOptions,
    WithRequired,
} from "@tanstack/react-query"
import { Transaction } from "../../api/transaction/types"
import { PresetUser, User, Balance } from "../../api/user/types"
import { Instrument } from "../../api/instrument/types"
import { Price } from "../../api/price/types"
import { Config, FeatureFlag } from "../../api/featureFlags/types"
import {
    OrderStatusHistoryResponse,
    OrderStatusResponse,
} from "../../api/creditCard/order"
import { ServiceVersion } from "../../api/version/types"

type IQueryContext = {
    getUser: (userId: string) => QueryFunction<User>
    getBalance: (userId: string) => QueryFunction<Balance>
    getPresetUsers: QueryFunction<PresetUser[]>
    getTransactions: (userId: string) => QueryFunction<Transaction[]>
    getInstruments: (userId?: string) => QueryFunction<Instrument[]>
    getLatestPrices: QueryFunction<Price[]>
    getInstrumentPrices: (instrumentId: string) => QueryFunction<Price[]>
    getFeatureFlags: QueryFunction<FeatureFlag[]>
    getConfig: QueryFunction<Config>
    getCreditCardStatus: (userId: string) => QueryFunction<OrderStatusResponse>
    getCreditCardStatusHistory: (
        userId: string
    ) => QueryFunction<OrderStatusHistoryResponse>
    getVersions: QueryFunction<ServiceVersion[]>
}
type QueryProviderProps = {
    getUser: (userId: string) => Promise<User>
    getBalance: (userId: string) => Promise<Balance>
    getPresetUsers: () => Promise<PresetUser[]>
    getTransactions: (userId: string) => Promise<Transaction[]>
    getInstruments: (userId?: string) => Promise<Instrument[]>
    getLatestPrices: () => Promise<Price[]>
    getInstrumentPrices: (instrumentId: string) => Promise<Price[]>
    getFeatureFlags: () => Promise<FeatureFlag[]>
    getConfig: () => Promise<Config>
    getCreditCardStatus: (userId: string) => Promise<OrderStatusResponse>
    getCreditCardStatusHistory: (
        userId: string
    ) => Promise<OrderStatusHistoryResponse>
    getVersions: () => Promise<ServiceVersion[]>
}

type QueryParams<T = unknown> = WithRequired<UseQueryOptions<T>, "queryKey">

export type { IQueryContext, QueryProviderProps, QueryParams }
