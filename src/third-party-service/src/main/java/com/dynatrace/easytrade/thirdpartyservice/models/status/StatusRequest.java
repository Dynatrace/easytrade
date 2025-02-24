package com.dynatrace.easytrade.thirdpartyservice.models.status;

import io.swagger.v3.oas.annotations.media.Schema;

import java.time.OffsetDateTime;
import java.util.Objects;

public record StatusRequest(String orderId, String type, OffsetDateTime timestamp,
        @Schema(description = "Used to pass specific status change related JSON - when necessary.", nullable = true, oneOf = {
                CreditCardBody.class, ShippingIdBody.class, ErrorBody.class }, defaultValue = "{}") Object details){
    public StatusRequest {
        Objects.requireNonNull(orderId);
        Objects.requireNonNull(type);
        Objects.requireNonNull(timestamp);
    }
}
