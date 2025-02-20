package com.dynatrace.easytrade.engine.models;

import java.time.OffsetDateTime;

import lombok.Getter;
import lombok.AllArgsConstructor;

@Getter
@AllArgsConstructor
public class Trade {
    private int id;
    private int accountId;
    private int instrumentId;
    private String direction;
    private double quantity;
    private double entryPrice;
    private OffsetDateTime timestampOpen;
    private OffsetDateTime timestampClose;
    private boolean tradeClosed;
    private boolean transactionHappened;
    private String status;
}