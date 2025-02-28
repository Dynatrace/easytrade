package com.dynatrace.easytrade.featureflagservice;

public class NonModifiableFlagException extends Exception {
    public NonModifiableFlagException(String errorMessage) {
        super(errorMessage);
    }
}
