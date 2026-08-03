package com.dynatrace.easytrade.creditcardorderservice.models;

import java.time.OffsetDateTime;
import java.util.Objects;
import java.util.Optional;

public record StatusRequest(String orderId, String type, OffsetDateTime timestamp,
        Optional<Object> details){
    public StatusRequest {
        Objects.requireNonNull(orderId);
        Objects.requireNonNull(type);
        Objects.requireNonNull(timestamp);
    }
}
