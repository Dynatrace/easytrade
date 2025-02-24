package com.dynatrace.easytrade.thirdpartyservice;

import jakarta.annotation.PostConstruct;
import jakarta.annotation.PreDestroy;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.util.StringUtils;

import java.util.Random;
import java.util.concurrent.ScheduledExecutorService;
import java.util.concurrent.ScheduledFuture;
import java.util.concurrent.TimeUnit;

public abstract class BaseScheduler {
    private static final Logger logger = LoggerFactory.getLogger(BaseScheduler.class);
    private ScheduledFuture<?> scheduledFuture;

    private String name;
    private int delayInSeconds;
    private int fixedRateInSeconds;
    protected final Random random = new Random();

    @Autowired
    ScheduledExecutorService scheduler;

    @PostConstruct
    public void init() { start(); }

    @PreDestroy
    public void preDestroy() { stop(); }

    public BaseScheduler(String name, int delayInSeconds, int fixedRateInSeconds) {
        this.name = name;
        this.delayInSeconds = delayInSeconds;
        this.fixedRateInSeconds = fixedRateInSeconds;
    }

    public void start() {
        logger.info("Starting {} scheduler with a delay of {} and fixed rate of {}.", name.toLowerCase(), delayInSeconds, fixedRateInSeconds);

        if (scheduledFuture == null) {
            scheduledFuture = scheduler.scheduleAtFixedRate(this::run, delayInSeconds, fixedRateInSeconds, TimeUnit.SECONDS);

            logger.info("{} scheduler started.", StringUtils.capitalize(name.toLowerCase()));
        } else {
            logger.info("{} scheduler was already started!", StringUtils.capitalize(name.toLowerCase()));
        }
    }

    public void stop() {
        logger.info("Stopping {} scheduler.", name.toLowerCase());

        if (scheduledFuture != null) {
            scheduledFuture.cancel(false);
            scheduledFuture = null;

            logger.info("{} scheduler stopped.", StringUtils.capitalize(name.toLowerCase()));
        } else {
            logger.info("{} scheduler was already stopped!", StringUtils.capitalize(name.toLowerCase()));
        }
    }

    protected abstract void run();

    protected void randomFixedRatePlusSleep() {
        try {
            Thread.sleep((fixedRateInSeconds + random.nextInt(fixedRateInSeconds))*1000);
        } catch (InterruptedException e) {
            logger.error("Caught exception while sleeping: " + e.getMessage(), e);
            throw new RuntimeException(e);
        }
    }
}
