package com.dynatrace.easytrade.thirdpartyservice.models.status;

import java.util.Objects;

public record ShippingIdBody(String shippingId) {
    public ShippingIdBody {
        Objects.requireNonNull(shippingId);
    }
}