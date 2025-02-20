package com.dynatrace.easytrade.thirdpartyservice.models;

import java.util.Objects;

public record CreditCardRequest(String creditCardOrderId, String name, String cardLevel) {
    public CreditCardRequest {
        Objects.requireNonNull(creditCardOrderId);
        Objects.requireNonNull(name);
        Objects.requireNonNull(cardLevel);
    }
}
