import { EnvProxy } from "../../env"
import { CreditCardBackend } from "./creditCard"
import { ProblemPatternBackend } from "./problemPatterns"
import { InstrumentBackend } from "./instruments"
import { PriceBackend } from "./prices"
import { TransactionBackend } from "./transactions"
import { UserBackend } from "./users"
import { ConfigBackend } from "./configFeatureFlags"
import { VersionBackend } from "./version"

export const backends = {
    problemPatterns: new ProblemPatternBackend(
        EnvProxy.getFeatureFlagServiceUrl()
    ),
    config: new ConfigBackend(EnvProxy.getFeatureFlagServiceUrl()),
    users: new UserBackend(
        EnvProxy.getAccountServiceUrl(),
        EnvProxy.getLoginServiceUrl(),
        EnvProxy.getBrokerServiceUrl()
    ),
    instruments: new InstrumentBackend(EnvProxy.getBrokerServiceUrl()),
    prices: new PriceBackend(EnvProxy.getPricingServiceUrl()),
    transactions: new TransactionBackend(EnvProxy.getBrokerServiceUrl()),
    creditCards: new CreditCardBackend(
        EnvProxy.getBrokerServiceUrl(),
        EnvProxy.getCreditCardServiceUrl()
    ),
    versions: new VersionBackend(),
}
