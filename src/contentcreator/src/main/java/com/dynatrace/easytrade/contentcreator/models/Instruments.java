package com.dynatrace.easytrade.contentcreator.models;

public enum Instruments {
    EASYTRAVEL(1, 150, 157.5, 165, 142.5, 135, 142.5, 135, 157.5, 0.7),
    EASYPLANES(2, 73, 80, 87, 94, 92, 100, 50, 60, 0.3),
    EASYHOTELS(3, 25, 24, 26, 20, 17, 20, 30, 35, 0.1),
    JANGRP(4, 0.2170, 0.2370, 0.2270, 0.2070, 0.2370, 0.2170, 0.2370, 0.2070, 0.001),
    CORFIG(5, 0.2440, 0.2565, 0.2690, 0.2815, 0.2690, 0.2815, 0.2440, 0.2315, 0.001),
    CMRTIN(6, 2.1740, 2.0740, 1.9740, 2.0740, 1.8740, 2.0740, 2.2740, 2.3740, 0.01),
    CHAMAT(7, 1.1270, 1.1770, 1.2270, 1.2770, 1.3270, 1.2770, 1.2270, 1.1770, 0.01),
    BLSTCR(8, 10.0210, 9.5210, 9.0210, 8.5210, 8.0210, 8.5210, 9.0210, 9.5210, 0.04),
    CAFGAL(9, 4.6130, 4.7830, 4.6130, 4.4430, 4.6130, 4.9530, 4.6130, 4.2730, 0.02),
    DECGRP(10, 0.8870, 0.8470, 0.9270, 0.8070, 0.9670, 0.7670, 1.0070, 0.7270, 0.005),
    PETBAN(11, 4.0950, 3.6950, 4.2950, 4.2950, 3.6950, 3.4950, 3.4950, 3.8950, 0.02),
    BATBAT(12, 8.8910, 9.6910, 8.4910, 8.4910, 8.0910, 9.2910, 9.2910, 8.4910, 0.04),
    STOLLC(13, 0.4620, 0.4820, 0.4420, 0.5020, 0.4220, 0.4820, 0.4420, 0.5020, 0.002),
    LEBRGA(14, 0.1120, 0.0820, 0.1020, 0.0820, 0.0920, 0.0820, 0.0820, 0.1220, 0.0007),
    MOROBA(15, 0.0997, 0.1047, 0.1097, 0.1047, 0.1097, 0.1147, 0.1097, 0.1147, 0.0007);

    private final int instrumentId;
    private final double time0;
    private final double time3;
    private final double time6;
    private final double time9;
    private final double time12;
    private final double time15;
    private final double time18;
    private final double time21;
    private final double baseDifference;

    Instruments(int instrumentId, double time0, double time3, double time6, double time9, double time12, double time15,
            double time18, double time21, double baseDifference) {
        this.instrumentId = instrumentId;
        this.time0 = time0;
        this.time3 = time3;
        this.time6 = time6;
        this.time9 = time9;
        this.time12 = time12;
        this.time15 = time15;
        this.time18 = time18;
        this.time21 = time21;
        this.baseDifference = baseDifference;
    }

    public int getInstrumentId() {
        return instrumentId;
    }

    public double getTime0() {
        return time0;
    }

    public double getTime3() {
        return time3;
    }

    public double getTime6() {
        return time6;
    }

    public double getTime9() {
        return time9;
    }

    public double getTime12() {
        return time12;
    }

    public double getTime15() {
        return time15;
    }

    public double getTime18() {
        return time18;
    }

    public double getTime21() {
        return time21;
    }

    public double getBaseDifference() {
        return baseDifference;
    }
}
