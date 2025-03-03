package com.dynatrace.easytrade.thirdpartyservice;

import com.dynatrace.easytrade.thirdpartyservice.models.OrderStatus;
import com.dynatrace.easytrade.thirdpartyservice.models.ShippingAddress;
import com.dynatrace.easytrade.thirdpartyservice.models.StandardResponse;
import com.dynatrace.easytrade.thirdpartyservice.models.status.StatusRequest;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.io.IOException;
import java.net.URI;
import java.net.URLEncoder;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.OffsetDateTime;

public class ServiceHelper {
    private static final Logger logger = LoggerFactory.getLogger(ServiceHelper.class);
    private final HttpClient httpClient = HttpClient.newBuilder().build();
    private final ObjectMapper mapper;
    private final String creditCardOrderService = System.getenv("CREDIT_CARD_ORDER_SERVICE_HOSTANDPORT");

    public ServiceHelper() {
        mapper = new ObjectMapper()
                .registerModule(new JavaTimeModule())
                .disable(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS);
    }

    public ShippingAddress getShippingAddress(String creditCardOrderId) {
        logger.info("Getting shipping address for order: {}", creditCardOrderId);

        try {
            // file deepcode ignore Ssrf: trusted environment variable
            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(String.format("http://%s/v1/orders/%s/shipping-address", creditCardOrderService,
                            URLEncoder.encode(creditCardOrderId, "UTF-8"))))
                    .GET()
                    .build();

            HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
            StandardResponse standardResponse = mapper.readValue(response.body(), StandardResponse.class);

            if (standardResponse.statusCode() == 200) {
                ShippingAddress shippingAddress = mapper.convertValue(standardResponse.results(),
                        ShippingAddress.class);
                logger.info("Got address info: {}", shippingAddress);
                return shippingAddress;
            } else {
                logger.info("Status code received is {}, and the message is: {}", standardResponse.statusCode(),
                        standardResponse.message());
                return null;
            }
        } catch (IOException e) {
            logger.error(e.getLocalizedMessage(), e);
            throw new RuntimeException(e);
        } catch (InterruptedException e) {
            logger.error(e.getLocalizedMessage(), e);
            throw new RuntimeException(e);
        }
    }

    public void updateStatus(OrderStatus status, String creditCardOrderId, Object details) {
        StatusRequest body = new StatusRequest(creditCardOrderId, status.toString(), OffsetDateTime.now(), details);

        try {
            logger.info("Running updateStatus with data: {}", mapper.writeValueAsString(body));
            // deepcode ignore Ssrf: trusted environment variable
            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(
                            String.format("http://%s/v1/orders/%s/status", creditCardOrderService,
                                    URLEncoder.encode(creditCardOrderId, "UTF-8"))))
                    .POST(HttpRequest.BodyPublishers.ofString(mapper.writeValueAsString(body)))
                    .header("Content-Type", "application/json")
                    .build();

            HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
            StandardResponse standardResponse = mapper.readValue(response.body(), StandardResponse.class);

            if (standardResponse.statusCode() == 200) {
                logger.info("UpdateStatus finished successfully with message: {}", standardResponse.message());
            } else {
                logger.info("Status code received is {}, and the message is: {}", standardResponse.statusCode(),
                        standardResponse.message());
            }
        } catch (IOException e) {
            logger.error(e.getLocalizedMessage(), e);
            throw new RuntimeException(e);
        } catch (InterruptedException e) {
            logger.error(e.getLocalizedMessage(), e);
            throw new RuntimeException(e);
        }
    }
}
