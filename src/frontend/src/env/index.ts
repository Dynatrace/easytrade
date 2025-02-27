// the calls to import.meta.env.* are replaced during build
// so they can't be accessed dynamically
// like import.meta.env[name]

export class EnvProxy {
    static getFeatureFlagServiceUrl(): string {
        return `${window.location.origin}/feature-flag-service/v1`
    }

    static getAccountServiceUrl(): string {
        return `${window.location.origin}/accountservice/api`
    }

    static getLoginServiceUrl(): string {
        return `${window.location.origin}/loginservice/api`
    }

    static getBrokerServiceUrl(): string {
        return `${window.location.origin}/broker-service/v1`
    }

    static getPricingServiceUrl(): string {
        return `${window.location.origin}/pricing-service/v1`
    }

    static getCreditCardServiceUrl(): string {
        return `${window.location.origin}/credit-card-order-service/v1`
    }
}
