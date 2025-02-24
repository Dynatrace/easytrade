package com.dynatrace.easytrade.creditcardorderservice.models;

import java.util.List;

public record CreditCardOrderStatusHistory(String creditCardOrderId,List<CreditCardOrderStatus> statusList) {}
