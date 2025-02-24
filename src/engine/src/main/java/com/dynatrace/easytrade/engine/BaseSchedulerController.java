package com.dynatrace.easytrade.engine;

import com.dynatrace.easytrade.engine.models.Trade;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.TaskScheduler;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;

import java.time.Duration;
import java.util.concurrent.ScheduledFuture;

public abstract class BaseSchedulerController {
    private static final Logger logger = LoggerFactory.getLogger(BaseSchedulerController.class);
    private ScheduledFuture<?> scheduledFuture;
    private String name;
    private Duration rate;

    @Autowired
    TaskScheduler taskScheduler;

    public BaseSchedulerController(String controllerName, Duration fixedRate) {
        name = controllerName;
        rate = fixedRate;
    }

    @GetMapping("/start")
    public String start() {
        logger.info(String.format("Starting %s scheduler with a rate of %ds.", name.toLowerCase(), rate.toSeconds()));
        String message;

        if (scheduledFuture == null) {
            scheduledFuture = taskScheduler.scheduleAtFixedRate(run(), rate);

            message = String.format("%s scheduler started.", StringUtils.capitalize(name.toLowerCase()));
            logger.info(message);
            return message;
        }

        message = String.format("%s scheduler was already started!", StringUtils.capitalize(name.toLowerCase()));
        logger.info(message);
        return message;
    }

    @GetMapping("/stop")
    public String stop() {
        logger.info(String.format("Stopping %s scheduler.", name.toLowerCase()));
        String message;

        if (scheduledFuture != null) {
            scheduledFuture.cancel(false);
            scheduledFuture = null;

            message = String.format("%s scheduler stopped.", StringUtils.capitalize(name.toLowerCase()));
            logger.info(message);
            return message;
        }

        message = String.format("%s scheduler was already stopped!", StringUtils.capitalize(name.toLowerCase()));
        logger.info(message);
        return message;
    }

    @GetMapping("/status")
    public String status() {
        return String.format("%s scheduler is currently %s.",
                StringUtils.capitalize(name.toLowerCase()),
                scheduledFuture == null ? "stopped" : "running");
    }

    @PostMapping("/notification")
    public void notification(@RequestBody Trade trade) throws Exception {
        var message = String.format("Trade with ID [%d] was closed, transaction happened [%b], status [%s]", 
                                    trade.getId(), trade.isTransactionHappened(), trade.getStatus());
        logger.info(message);
    } 

    protected abstract Runnable run();
}
