package com.dynatrace.easytrade.featureflagservice;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.*;
import java.util.stream.*;

@Configuration
public class FeatureFlagConfig {
        @Value("${app.flags.enableModify}")
        private String enableModify;
        @Value("${app.flags.enableDbNotResponding}")
        private String enableDbNotResponding;
        @Value("${app.flags.enableErgoAggregatorSlowdown}")
        private String enableErgoAggregatorSlowdown;
        @Value("${app.flags.enableFactoryCrisis}")
        private String enableFactoryCrisis;
        @Value("${app.flags.enableFrontendModify}")
        private String enableFrontendModify;
        @Value("${app.flags.enableCreditCardMeltdown}")
        private String enableCreditCardMeltdown;
        @Value("${app.flags.enableHighCpuUsage}")
        private String enableHighCpuUsage;

        @Bean
        public Map<String, Flag> flagRegistry() {
                boolean isModifiable = Boolean.parseBoolean(enableModify);
                var configFlags = Map.of("frontend_feature_flag_management",
                                new Flag("frontend_feature_flag_management",
                                                Boolean.parseBoolean(enableFrontendModify),
                                                "Frontend feature flag management",
                                                "When enabled allows controlling problem pattern feature flags from the main app UI.",
                                                false, "config"));
                var problemPatterns = Map.of("db_not_responding",
                                new Flag("db_not_responding", Boolean.parseBoolean(enableDbNotResponding),
                                                "DB not responding",
                                                "When enabled, the DB not responding will be simulated, this will cause errors when trying to create any new transactions.",
                                                isModifiable, "problem_pattern"),
                                "ergo_aggregator_slowdown",
                                new Flag("ergo_aggregator_slowdown",
                                                Boolean.parseBoolean(enableErgoAggregatorSlowdown),
                                                "Ergo aggregator slowdown",
                                                "When enabled, the OfferService will respond with delay to 2 out of 5 AggregatorServices querying it, which will result in those services pausing the queries for 1h.",
                                                isModifiable, "problem_pattern"),
                                "factory_crisis",
                                new Flag("factory_crisis", Boolean.parseBoolean(enableFactoryCrisis),
                                                "Factory crisis",
                                                "When enabled, the factory won't produce new cards, which will cause the Third party service not to process credit card orders.",
                                                isModifiable, "problem_pattern"),
                                "credit_card_meltdown",
                                new Flag("credit_card_meltdown",
                                                Boolean.parseBoolean(enableCreditCardMeltdown),
                                                "OrderController service error",
                                                "When enabled, then checking latest status will result in a division by 0 error. This results in visits to the Credit Card frontend tab resulting in an ugly error page.",
                                                isModifiable, "problem_pattern"),
                                "high_cpu_usage",
                                new Flag("high_cpu_usage", Boolean.parseBoolean(enableHighCpuUsage),
                                                "K8s: high CPU usage",
                                                "Causes a slowdown of broker-service response time and increases CPU usage during that time. If the app is deployed on K8s, a CPU resource limit is also applied.",
                                                isModifiable, "problem_pattern"));
                return Stream
                                .of(configFlags, problemPatterns)
                                .flatMap(m -> m.entrySet().stream())
                                .collect(Collectors.toMap(Map.Entry::getKey, Map.Entry::getValue));
        }
}
