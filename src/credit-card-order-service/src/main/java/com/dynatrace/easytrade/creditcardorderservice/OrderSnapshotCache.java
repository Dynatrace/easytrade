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
 * evicts them. The heap fills up until the JVM throws {@code OutOfMemoryError}
 * and exits, and Kubernetes restarts it. Turning the flag off drops the cached
 * snapshots.
 * <p>
 * While the flag is on, the cache also recomputes order totals every second in
 * scratch buffers it drops right away. That short-lived garbage keeps the
 * young generation filling up, so the JVM collects it several times a minute,
 * like a busy production service, instead of the idle pod's less than once a
 * minute. The leaked snapshots then survive many collections each minute while
 * the scratch buffers survive none.
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
    static final int SCRATCH_BUFFER_BYTES = 16 * 1024;
    static final int CHURN_TICK_MILLIS = 1000;
    private static final int DEFAULT_LEAK_MB_PER_MINUTE = 5;
    private static final int DEFAULT_CHURN_MB_PER_MINUTE = 600;

    // Static and never evicted while the flag is on: this is the leak.
    private static final List<byte[]> SNAPSHOTS = new ArrayList<>();

    private final OpenFeatureAPI openFeatureAPI;
    private final int snapshotsPerTick;
    private final int scratchBuffersPerTick;
    // Read by nothing; keeps the JIT from dropping the scratch work.
    private volatile long lastTotalsChecksum;
    private final ScheduledExecutorService executor = Executors.newSingleThreadScheduledExecutor(runnable -> {
        Thread thread = new Thread(runnable, "order-snapshot-cache");
        thread.setDaemon(true);
        return thread;
    });

    @Autowired
    public OrderSnapshotCache(OpenFeatureAPI openFeatureAPI) {
        this(openFeatureAPI,
                mbPerMinuteFromEnv("MEMORY_LEAK_MB_PER_MINUTE", DEFAULT_LEAK_MB_PER_MINUTE),
                mbPerMinuteFromEnv("MEMORY_LEAK_CHURN_MB_PER_MINUTE", DEFAULT_CHURN_MB_PER_MINUTE));
    }

    OrderSnapshotCache(OpenFeatureAPI openFeatureAPI, int leakMbPerMinute, int churnMbPerMinute) {
        this.openFeatureAPI = openFeatureAPI;
        int bytesPerTick = leakMbPerMinute * 1024 * 1024 / (60 / TICK_SECONDS);
        this.snapshotsPerTick = Math.max(1, bytesPerTick / SNAPSHOT_SIZE_BYTES);
        long churnBytesPerTick = (long) churnMbPerMinute * 1024 * 1024 / (60_000 / CHURN_TICK_MILLIS);
        this.scratchBuffersPerTick = (int) (churnBytesPerTick / SCRATCH_BUFFER_BYTES);
    }

    @PostConstruct
    public void start() {
        executor.scheduleAtFixedRate(this::refresh, TICK_SECONDS, TICK_SECONDS, TimeUnit.SECONDS);
        executor.scheduleAtFixedRate(this::recalculate, CHURN_TICK_MILLIS, CHURN_TICK_MILLIS, TimeUnit.MILLISECONDS);
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

    void recalculate() {
        // Same as refresh: a run that throws would stop the schedule for good.
        try {
            if (scratchBuffersPerTick > 0 && openFeatureAPI.getClient().getBooleanValue(FLAG_ID, false)) {
                recalculateOrderTotals();
            }
        } catch (Exception e) {
            logger.error("Caught exception while recalculating order totals: " + e.getMessage(), e);
        }
    }

    // Short-lived on purpose: every buffer is garbage by the next iteration.
    private void recalculateOrderTotals() {
        long checksum = 0;
        for (int i = 0; i < scratchBuffersPerTick; i++) {
            byte[] scratch = new byte[SCRATCH_BUFFER_BYTES];
            Arrays.fill(scratch, (byte) i);
            checksum += scratch[i % SCRATCH_BUFFER_BYTES];
        }
        lastTotalsChecksum = checksum;
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

    private static int mbPerMinuteFromEnv(String name, int defaultValue) {
        String value = System.getenv(name);
        if (value == null || value.isBlank()) {
            return defaultValue;
        }
        try {
            return Integer.parseInt(value.trim());
        } catch (NumberFormatException e) {
            logger.warn("Invalid {} '{}', using {}.", name, value, defaultValue);
            return defaultValue;
        }
    }
}
