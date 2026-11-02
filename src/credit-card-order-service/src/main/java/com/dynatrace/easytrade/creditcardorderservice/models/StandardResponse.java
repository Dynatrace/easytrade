package com.dynatrace.easytrade.creditcardorderservice.models;

import com.fasterxml.jackson.annotation.JsonInclude;

@JsonInclude(JsonInclude.Include.NON_NULL)
public record StandardResponse(
        Integer statusCode,
        String message,
        Object results,
        Object data,
        Object error) {
}
