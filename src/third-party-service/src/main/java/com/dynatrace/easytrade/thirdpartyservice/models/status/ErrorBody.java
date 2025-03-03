package com.dynatrace.easytrade.thirdpartyservice.models.status;

import java.util.Objects;

public record ErrorBody(Integer errorCode, String errorType, String errorMessage) {
    public static final ErrorBody FACTORY_FAILURE = new ErrorBody(22, "delay", "Factory failure");
    public static final ErrorBody DELAY_ON_CHIPS = new ErrorBody(35, "delay", "Delay on chips");

    public ErrorBody {
        Objects.requireNonNull(errorCode);
        Objects.requireNonNull(errorType);
        Objects.requireNonNull(errorMessage);
    }
}
