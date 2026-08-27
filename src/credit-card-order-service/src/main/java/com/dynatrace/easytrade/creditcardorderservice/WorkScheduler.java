package com.dynatrace.easytrade.creditcardorderservice;

import com.dynatrace.easytrade.creditcardorderservice.models.ManufactureRequest;
import com.dynatrace.easytrade.creditcardorderservice.models.StandardResponse;
import com.dynatrace.easytrade.creditcardorderservice.models.StatusType;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.util.List;

@Service
public class WorkScheduler extends BaseScheduler {
    private static final Logger logger = LoggerFactory.getLogger(WorkScheduler.class);
    private final DbAdapterClient dbAdapterClient;
    private final String creditCardOrderService = System.getenv("THIRD_PARTY_SERVICE_ADDRESS");
    private final HttpClient httpClient = HttpClient.newBuilder().build();

    public WorkScheduler(DbAdapterClient dbAdapterClient) {
        super("work", Integer.parseInt(System.getenv("WORK_DELAY")), Integer.parseInt(System.getenv("WORK_RATE")));
        this.dbAdapterClient = dbAdapterClient;
    }

    @Override
    protected void run() {
        logger.info("Running WorkScheduler task!");

        try {
            List<ManufactureRequest> orders = dbAdapterClient.getOrdersToManufacture();
            ObjectMapper mapper = new ObjectMapper();

            for (ManufactureRequest body : orders) {
                logger.info("Calling manufacturer for order: " + body.creditCardOrderId());

                // deepcode ignore Ssrf: trusted environment variable
                HttpRequest request = HttpRequest.newBuilder()
                        .uri(URI.create(String.format("%s/v1/manufacturer", creditCardOrderService)))
                        .POST(HttpRequest.BodyPublishers.ofString(mapper.writeValueAsString(body)))
                        .header("Content-Type", "application/json")
                        .build();

                HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
                StandardResponse standardResponse = mapper.readValue(response.body(), StandardResponse.class);

                if (standardResponse.statusCode() == HttpStatus.OK.value()) {
                    logger.info("Ordered the manufacture of card with orderId: {}", body.creditCardOrderId());
                    dbAdapterClient.insertNewStatus(body.creditCardOrderId(), StatusType.CARD_ORDERED);
                } else {
                    logger.info("Failed to order card manufacture. Status code received is {}, and the message is: {}",
                            standardResponse.statusCode(), standardResponse.message());
                }
            }
        } catch (Exception e) {
            logger.error("Caught exception while running WorkScheduler's task: " + e.getMessage(), e);
        }

        logger.info("Finished WorkScheduler task!");

        randomFixedRatePlusSleep();
    }
}
