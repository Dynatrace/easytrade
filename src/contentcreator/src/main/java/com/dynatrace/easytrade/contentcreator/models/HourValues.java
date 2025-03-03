package com.dynatrace.easytrade.contentcreator.models;

public enum HourValues {
    H0(0*60*60),
    H3(3*60*60),
    H6(6*60*60),
    H9(9*60*60),
    H12(12*60*60),
    H15(15*60*60),
    H18(18*60*60),
    H21(21*60*60),
    H24(24*60*60);

    public final int value;

    HourValues(int value) {
        this.value = value;
    }
}
