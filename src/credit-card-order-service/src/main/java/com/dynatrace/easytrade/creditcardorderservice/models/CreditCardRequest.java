package com.dynatrace.easytrade.creditcardorderservice.models;

import java.time.OffsetDateTime;
import java.util.Objects;

public record CreditCardRequest(String cardLevel, String cardNumber, String cardCVS, OffsetDateTime cardValidDate) {
    public CreditCardRequest {
        Objects.requireNonNull(cardLevel);
        Objects.requireNonNull(cardNumber);
        Objects.requireNonNull(cardCVS);
        Objects.requireNonNull(cardValidDate);
    }
}
