package com.dynatrace.easytrade.creditcardorderservice.models;

import io.swagger.v3.oas.annotations.media.Schema;

import java.time.OffsetDateTime;
import java.util.Objects;
import java.util.Optional;

public record StatusRequest(String orderId, String type, OffsetDateTime timestamp,
        @Schema(description = "Used to pass specific status change related JSON - when necessary.", nullable = true, oneOf = {
                CreditCardRequest.class, ShippingIdRequest.class,
                ErrorRequest.class }, defaultValue = "{}") Optional<Object> details){
    public StatusRequest {
        Objects.requireNonNull(orderId);
        Objects.requireNonNull(type);
        Objects.requireNonNull(timestamp);
    }
}
