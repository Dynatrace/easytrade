package com.dynatrace.easytrade.creditcardorderservice.models;

import java.util.Objects;

public record CreditCardOrderRequest(Integer accountId, String email, String name, String shippingAddress, String cardLevel) {
    public CreditCardOrderRequest {
        Objects.requireNonNull(accountId);
        Objects.requireNonNull(email);
        Objects.requireNonNull(name);
        Objects.requireNonNull(shippingAddress);
        Objects.requireNonNull(cardLevel);
    }
}
