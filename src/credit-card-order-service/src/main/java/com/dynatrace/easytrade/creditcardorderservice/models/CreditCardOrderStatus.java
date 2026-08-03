package com.dynatrace.easytrade.creditcardorderservice.models;

import java.time.OffsetDateTime;

public record CreditCardOrderStatus(Integer id, String creditCardOrderId, OffsetDateTime timestamp, String status,
                String details) {
}
