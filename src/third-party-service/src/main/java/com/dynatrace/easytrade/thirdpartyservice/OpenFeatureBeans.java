package com.dynatrace.easytrade.thirdpartyservice;

import dev.openfeature.sdk.OpenFeatureAPI;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class OpenFeatureBeans {
    @Bean
    public OpenFeatureAPI OpenFeatureAPI() {
        final OpenFeatureAPI openFeatureAPI = OpenFeatureAPI.getInstance();

        openFeatureAPI.setProvider(new JavaProvider());

        return openFeatureAPI;
    }
}
