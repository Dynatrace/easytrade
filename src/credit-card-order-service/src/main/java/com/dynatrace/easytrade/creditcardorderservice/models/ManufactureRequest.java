package com.dynatrace.easytrade.creditcardorderservice.models;

import java.util.Objects;

public record ManufactureRequest(String creditCardOrderId, String name, String cardLevel) {
    public ManufactureRequest {
        Objects.requireNonNull(creditCardOrderId);
        Objects.requireNonNull(name);
        Objects.requireNonNull(cardLevel);
    }
}