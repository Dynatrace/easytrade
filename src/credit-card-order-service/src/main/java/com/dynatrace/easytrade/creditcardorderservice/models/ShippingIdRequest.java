package com.dynatrace.easytrade.creditcardorderservice.models;

import java.util.Objects;

public record ShippingIdRequest(String shippingId) {
    public ShippingIdRequest {
        Objects.requireNonNull(shippingId);
    }
}
