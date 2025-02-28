package com.dynatrace.easytrade.creditcardorderservice.models;

import java.util.Objects;

public record ErrorRequest(Integer errorCode, String errorType, String errorMessage) {
    public ErrorRequest {
        Objects.requireNonNull(errorCode);
        Objects.requireNonNull(errorType);
        Objects.requireNonNull(errorMessage);
    }
}
