package com.dynatrace.easytrade.thirdpartyservice;

import java.io.IOException;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.dynatrace.easytrade.thirdpartyservice.models.FeatureFlag;
import com.fasterxml.jackson.databind.ObjectMapper;

public class FeatureFlagClient {
    private static final Logger logger = LoggerFactory.getLogger(FeatureFlagClient.class);
    private final HttpClient httpClient = HttpClient.newBuilder().build();
    private final ObjectMapper mapper = new ObjectMapper();
    private final String featureFlagServiceUrl = System.getenv("FEATURE_FLAG_SERVICE_PROTOCOL") + "://"
            + System.getenv("FEATURE_FLAG_SERVICE_BASE_URL") + ":" + System.getenv("FEATURE_FLAG_SERVICE_PORT")
            + "/v1/flags/";

    public FeatureFlag getFlag(String flagId) {
        logger.info("Getting feature flag with id: {}", flagId);
        // deepcode ignore Ssrf: trusted environment variable
        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create(featureFlagServiceUrl + flagId))
                .GET()
                .build();
        try {
            HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
            return mapper.readValue(response.body(), FeatureFlag.class);
        } catch (IOException | InterruptedException e) {
            throw new RuntimeException(e);
        }
    }
}
