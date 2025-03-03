package com.dynatrace.easytrade.thirdpartyservice.models;

import com.fasterxml.jackson.annotation.JsonInclude;
import io.swagger.v3.oas.annotations.media.Schema;

@JsonInclude(JsonInclude.Include.NON_NULL)
@Schema(description = "This is how responses look. They always have statusCode and message. The rest depends on occasion.")
public record StandardResponse(
                Integer statusCode,
                String message,
                @Schema(nullable = true, description = "If the action needs a result, it will be here.",
                                // oneOf = { ShippingAddressResponse.class, CreditCardOrderResponse.class,
                                // CreditCardOrderStatus.class },
                                defaultValue = "{}") Object results,
                @Schema(nullable = true, description = "If the action failed not critically, then additional information might be passed here.") Object data,
                @Schema(nullable = true, description = "If there was an exception, the cause should be here.") Object error) {
}
