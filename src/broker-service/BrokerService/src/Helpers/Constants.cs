namespace EasyTrade.BrokerService.Helpers
{
    public static class Constants
    {
        public const string PricingService = "PRICINGSERVICE_HOSTANDPORT";
        public const string AccountService = "ACCOUNTSERVICE_HOSTANDPORT";
        public const string EngineService = "ENGINE_HOSTANDPORT";
        public const string ProxyPrefix = "PROXY_PREFIX";
        public const string MsSqlConnectionString = "MSSQL_CONNECTIONSTRING";
        public const string FeatureFlagServiceProtocol = "FEATURE_FLAG_SERVICE_PROTOCOL";
        public const string FeatureFlagServiceBaseUrl = "FEATURE_FLAG_SERVICE_BASE_URL";
        public const string FeatureFlagServicePort = "FEATURE_FLAG_SERVICE_PORT";
        public const string HighCpuUsageRequestDelayMs = "HIGH_CPU_USAGE_REQUEST_DELAY_MS";
        public const string HighCpuUsageConcurrency = "HIGH_CPU_USAGE_CONCURRENCY";
        public const string FeatureFlagCacheDurationS = "FEATURE_FLAG_CACHE_DURATION_S";
        public const int OwnerId = 1;
        public const int InvalidTradeId = -1;
        public const string DbNotResponding = "db_not_responding";
        public const string HighCpuUsage = "high_cpu_usage";
        public const string BuildVersion = "BuildVersion";
        public const string BuildDate = "BuildDate";
        public const string BuildCommit = "BuildCommit";
    }
}
