package com.dynatrace.easytrade.thirdpartyservice.models;

import com.dynatrace.easytrade.thirdpartyservice.models.status.CreditCardBody;
import lombok.Getter;
import lombok.Setter;
import lombok.ToString;

@Setter
@Getter
@ToString
public class ManufactureProcess {
    private CreditCardRequest request;
    private ManufactureStatus status;
    private CreditCardBody cardDetails;

    public ManufactureProcess(CreditCardRequest request) {
        this.request = request;
        status = ManufactureStatus.ISSUING;
        cardDetails = null;
    }
}
