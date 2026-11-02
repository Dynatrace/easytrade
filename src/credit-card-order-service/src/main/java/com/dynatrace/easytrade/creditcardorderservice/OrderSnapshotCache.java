package com.dynatrace.easytrade.creditcardorderservice;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.concurrent.Executors;
import java.util.concurrent.ScheduledExecutorService;
import java.util.concurrent.TimeUnit;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import dev.openfeature.sdk.OpenFeatureAPI;
import jakarta.annotation.PostConstruct;
import jakarta.annotation.PreDestroy;

/**
 * Keeps serialized snapshots of credit card orders so status lookups can skip
 * the database.
 * <p>
 * Problem pattern {@code credit_card_memory_leak}: while the flag is on, every
 * tick caches a new batch of snapshots in a static list and nothing ever
 * evicts them. The heap grows until the container exceeds its memory limit and
 * Kubernetes OOM-kills it. Turning the flag off drops the cached snapshots.
 * <p>
 * Runs on its own thread because the shared scheduler pool has a single thread
 * that {@link WorkScheduler} keeps busy between its runs.
 */
@Service
public class OrderSnapshotCache {
    private static final Logger logger = LoggerFactory.getLogger(OrderSnapshotCache.class);

    static final String FLAG_ID = "credit_card_memory_leak";
    static final int SNAPSHOT_SIZE_BYTES = 64 * 1024;
    static final int TICK_SECONDS = 15;
    private static final int DEFAULT_LEAK_MB_PER_MINUTE = 8;

    // Static and never evicted while the flag is on: this is the leak.
    private static final List<byte[]> SNAPSHOTS = new ArrayList<>();

    private final OpenFeatureAPI openFeatureAPI;
    private final int snapshotsPerTick;
    private final ScheduledExecutorService executor = Executors.newSingleThreadScheduledExecutor(runnable -> {
        Thread thread = new Thread(runnable, "order-snapshot-cache");
        thread.setDaemon(true);
        return thread;
    });

    @Autowired
    public OrderSnapshotCache(OpenFeatureAPI openFeatureAPI) {
        this(openFeatureAPI, leakMbPerMinuteFromEnv());
    }

    OrderSnapshotCache(OpenFeatureAPI openFeatureAPI, int leakMbPerMinute) {
        this.openFeatureAPI = openFeatureAPI;
        int bytesPerTick = leakMbPerMinute * 1024 * 1024 / (60 / TICK_SECONDS);
        this.snapshotsPerTick = Math.max(1, bytesPerTick / SNAPSHOT_SIZE_BYTES);
    }

    @PostConstruct
    public void start() {
        executor.scheduleAtFixedRate(this::refresh, TICK_SECONDS, TICK_SECONDS, TimeUnit.SECONDS);
    }

    @PreDestroy
    public void stop() {
        executor.shutdownNow();
    }

    void refresh() {
        // scheduleAtFixedRate stops for good if a run throws, so never let one escape.
        try {
            if (openFeatureAPI.getClient().getBooleanValue(FLAG_ID, false)) {
                cacheOrderSnapshots();
            } else if (!SNAPSHOTS.isEmpty()) {
                logger.info("Dropping {} cached order snapshots.", SNAPSHOTS.size());
                SNAPSHOTS.clear();
            }
        } catch (Exception e) {
            logger.error("Caught exception while refreshing order snapshots: " + e.getMessage(), e);
        }
    }

    private void cacheOrderSnapshots() {
        for (int i = 0; i < snapshotsPerTick; i++) {
            byte[] snapshot = new byte[SNAPSHOT_SIZE_BYTES];
            Arrays.fill(snapshot, (byte) i);
            SNAPSHOTS.add(snapshot);
        }
        logger.debug("Cached {} order snapshots ({} total).", snapshotsPerTick, SNAPSHOTS.size());
    }

    static int cachedSnapshotCount() {
        return SNAPSHOTS.size();
    }

    static void clearSnapshots() {
        SNAPSHOTS.clear();
    }

    private static int leakMbPerMinuteFromEnv() {
        String value = System.getenv("MEMORY_LEAK_MB_PER_MINUTE");
        if (value == null || value.isBlank()) {
            return DEFAULT_LEAK_MB_PER_MINUTE;
        }
        try {
            return Integer.parseInt(value.trim());
        } catch (NumberFormatException e) {
            logger.warn("Invalid MEMORY_LEAK_MB_PER_MINUTE '{}', using {}.", value, DEFAULT_LEAK_MB_PER_MINUTE);
            return DEFAULT_LEAK_MB_PER_MINUTE;
        }
    }
}
