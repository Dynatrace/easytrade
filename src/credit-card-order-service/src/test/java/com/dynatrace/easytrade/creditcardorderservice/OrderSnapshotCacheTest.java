package com.dynatrace.easytrade.creditcardorderservice;

import dev.openfeature.sdk.Client;
import dev.openfeature.sdk.OpenFeatureAPI;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.Mockito;
import org.mockito.junit.jupiter.MockitoExtension;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.anyBoolean;
import static org.mockito.ArgumentMatchers.eq;

@ExtendWith(MockitoExtension.class)
public class OrderSnapshotCacheTest {
    // 8 MB per minute at a 15 s tick = 2 MB per tick = 32 snapshots of 64 KB.
    private static final int LEAK_MB_PER_MINUTE = 8;
    private static final int SNAPSHOTS_PER_TICK = 32;

    @Mock
    OpenFeatureAPI openFeatureAPI;
    @Mock
    Client client;

    private OrderSnapshotCache cache;

    @BeforeEach
    void setUp() {
        Mockito.when(openFeatureAPI.getClient()).thenReturn(client);
        cache = new OrderSnapshotCache(openFeatureAPI, LEAK_MB_PER_MINUTE);
    }

    @AfterEach
    void tearDown() {
        OrderSnapshotCache.clearSnapshots();
    }

    @Test
    void refresh_flagOff_cachesNothing() {
        flagEnabled(false);

        cache.refresh();

        assertEquals(0, OrderSnapshotCache.cachedSnapshotCount());
    }

    @Test
    void refresh_flagOn_keepsGrowingEveryTick() {
        flagEnabled(true);

        cache.refresh();
        cache.refresh();
        cache.refresh();

        assertEquals(3 * SNAPSHOTS_PER_TICK, OrderSnapshotCache.cachedSnapshotCount());
    }

    @Test
    void refresh_flagTurnedOff_dropsCachedSnapshots() {
        flagEnabled(true);
        cache.refresh();

        flagEnabled(false);
        cache.refresh();

        assertEquals(0, OrderSnapshotCache.cachedSnapshotCount());
    }

    @Test
    void refresh_flagServiceUnavailable_doesNotThrow() {
        Mockito.when(client.getBooleanValue(eq(OrderSnapshotCache.FLAG_ID), anyBoolean()))
                .thenThrow(new RuntimeException("feature-flag-service unreachable"));

        cache.refresh();

        assertEquals(0, OrderSnapshotCache.cachedSnapshotCount());
    }

    private void flagEnabled(boolean enabled) {
        Mockito.when(client.getBooleanValue(eq(OrderSnapshotCache.FLAG_ID), anyBoolean())).thenReturn(enabled);
    }
}
