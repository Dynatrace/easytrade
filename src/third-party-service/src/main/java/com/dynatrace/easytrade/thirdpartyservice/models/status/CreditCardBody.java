package com.dynatrace.easytrade.thirdpartyservice.models.status;

import java.time.OffsetDateTime;
import java.util.Objects;

public record CreditCardBody(String cardLevel, String cardNumber, String cardCVS, OffsetDateTime cardValidDate) {
    public CreditCardBody {
        Objects.requireNonNull(cardLevel);
        Objects.requireNonNull(cardNumber);
        Objects.requireNonNull(cardCVS);
        Objects.requireNonNull(cardValidDate);
    }
}
