package com.dynatrace.easytrade.creditcardorderservice.models;

import lombok.Getter;

@Getter
public enum StatusType {
    ORDER_CREATED(10, "order_created", "An order for a credit card has been accepted."),
    CARD_ORDERED(20, "card_ordered", "Credit card is being manufactured."),
    CARD_CREATED(39, "card_created", "Card has been successfully manufactured."),
    CARD_ERROR(30, "card_error", "There occurred an error during card manufacture."),
    CARD_SHIPPED(40, "card_shipped", "Card has been shipped to the client."),
    CARD_DELIVERED(50, "card_delivered", "Card has been received by the client."),
    SEQUENCE_ERROR(99, "sequence_error", "Wrong sequence of status occurred. Please verify the whole process!")
    ;

    private int sequence;
    private String type;
    private String description;

    StatusType(int sequence, String type, String description) {
        this.sequence = sequence;
        this.type = type;
        this.description = description;
    }
}
