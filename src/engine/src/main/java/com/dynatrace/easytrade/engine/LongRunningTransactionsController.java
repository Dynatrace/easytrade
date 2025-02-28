package com.dynatrace.easytrade.engine;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.web.bind.annotation.*;

import javax.annotation.PostConstruct;
import javax.annotation.PreDestroy;
import java.io.IOException;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import java.time.Instant;

@RestController
@RequestMapping("/trade/scheduler")
@CrossOrigin
public class LongRunningTransactionsController extends BaseSchedulerController {
    private static final Logger logger = LoggerFactory.getLogger(LongRunningTransactionsController.class);
    private final HttpClient httpClient =  HttpClient.newBuilder().build();
    private final String broker = System.getenv("BROKER_HOSTANDPORT");

    public LongRunningTransactionsController() {
        super("longRunningTransaction", Duration.ofMinutes(1));
    }

    @PostConstruct
    public void init() {
        start();
    }

    @PreDestroy
    public void preDestroy() { stop(); }

    @Override
    protected Runnable run() {
        return () -> tradeLogic();
    }

    private void tradeLogic() {
        logger.info("{}: Running tradeLogic. Invoking the service", Instant.now().toEpochMilli());
        // deepcode ignore Ssrf: trusted environment variable
        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create(String.format("http://%s/v1/trade/long/process", broker)))
                .POST(HttpRequest.BodyPublishers.noBody())
                .build();

        try {
            HttpResponse<String> response =  httpClient.send(request, HttpResponse.BodyHandlers.ofString());

            if (response.statusCode() == 200) {
                logger.info("{}: TradeLogic finished.", Instant.now().toEpochMilli());
            }
            else {
                logger.info("{}: Status code received is not 200 but: {}", Instant.now().toEpochMilli(), response.statusCode());
            }
        } catch (IOException e) {
            logger.error(e.getLocalizedMessage(), e);
            e.printStackTrace();
        } catch (InterruptedException e) {
            logger.error(e.getLocalizedMessage(), e);
            e.printStackTrace();
            Thread.currentThread().interrupt();
        }
    }
}
