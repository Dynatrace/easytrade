namespace EasyTrade.BrokerService.Helpers
{
    public static class Constants
    {
        public const string PricingService = "PRICINGSERVICE_HOSTANDPORT";
        public const string DbAdapterService = "DBADAPTER_HOSTANDPORT";
        public const string UserService = "USER_SERVICE_HOSTANDPORT";
        public const string FeatureFlagServiceProtocol = "FEATURE_FLAG_SERVICE_PROTOCOL";
        public const string FeatureFlagServiceBaseUrl = "FEATURE_FLAG_SERVICE_BASE_URL";
        public const string FeatureFlagServicePort = "FEATURE_FLAG_SERVICE_PORT";
        public const string HighCpuUsageRequestDelayMs = "HIGH_CPU_USAGE_REQUEST_DELAY_MS";
        public const string HighCpuUsageConcurrency = "HIGH_CPU_USAGE_CONCURRENCY";
        public const string FeatureFlagCacheDurationS = "FEATURE_FLAG_CACHE_DURATION_S";
        public static readonly Guid OwnerId = Guid.Parse("a0000000-0000-4000-8000-000000000000");
        public static readonly Guid InvalidTradeId = Guid.Empty;
        public const string DbNotResponding = "db_not_responding";
        public const string HighCpuUsage = "high_cpu_usage";
        public const string CreditCardValidation = "credit_card_validation";
        public const string MainframeServiceUrl = "MAINFRAME_SERVICE_URL";
        public const string BuildVersion = "BuildVersion";
        public const string BuildDate = "BuildDate";
        public const string BuildCommit = "BuildCommit";
    }
}
