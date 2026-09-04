export class EnvProxy {
    static getFeatureFlagServiceUrl(): string {
        return `${window.location.origin}/feature-flag-service/v1`
    }

    static getUserServiceUrl(): string {
        return `${window.location.origin}/user-service/api`
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
