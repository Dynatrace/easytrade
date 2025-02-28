package com.dynatrace.easytrade.thirdpartyservice.models;

import lombok.Getter;
import lombok.Setter;
import lombok.ToString;

@Setter
@Getter
@ToString
public class CourierProcess {
    private String creditCardOrderId;
    private CourierStatus status;
    private ShippingAddress address;
    private String shippingId;

    public CourierProcess(String creditCardOrderId) {
        this.creditCardOrderId = creditCardOrderId;
        status = CourierStatus.NEW_CARD_RECEIVED;
        address = null;
        shippingId = null;
    }
}
