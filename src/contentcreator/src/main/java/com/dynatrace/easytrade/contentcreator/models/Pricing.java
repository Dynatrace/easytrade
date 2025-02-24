package com.dynatrace.easytrade.contentcreator.models;

import java.sql.PreparedStatement;
import java.sql.SQLException;
import java.util.Date;
import java.text.SimpleDateFormat;

import com.dynatrace.easytrade.contentcreator.interfaces.IPreparableStatement;

public class Pricing implements IPreparableStatement {
    private final SimpleDateFormat dateFormatter = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss");
    private java.util.Date timestamp;
    private int instrumentId;
    private double open, high, low, close;

    public Pricing(Date timestamp, int instrumentId, double open, double high, double low, double close) {
        this.timestamp = timestamp;
        this.instrumentId = instrumentId;
        this.open = open;
        this.high = high;
        this.low = low;
        this.close = close;
    }

    public Date getTimestamp() {
        return timestamp;
    }

    public void setTimestamp(Date timestamp) {
        this.timestamp = timestamp;
    }

    public int getInstrumentId() {
        return instrumentId;
    }

    public void setInstrumentId(int instrumentId) {
        this.instrumentId = instrumentId;
    }

    public double getOpen() {
        return open;
    }

    public void setOpen(double open) {
        this.open = open;
    }

    public double getHigh() {
        return high;
    }

    public void setHigh(double high) {
        this.high = high;
    }

    public double getLow() {
        return low;
    }

    public void setLow(double low) {
        this.low = low;
    }

    public double getClose() {
        return close;
    }

    public void setClose(double close) {
        this.close = close;
    }

    @Override
    public String toString() {
        return "Pricing{" +
                "timestamp=" + timestamp +
                ", instrumentId=" + instrumentId +
                ", open=" + open +
                ", high=" + high +
                ", low=" + low +
                ", close=" + close +
                '}';
    }

    @Override
    public void prepareInsertStatement(PreparedStatement statement) throws SQLException {
        statement.setString(1, dateFormatter.format(timestamp));
        statement.setInt(2, instrumentId);
        statement.setDouble(3, open);
        statement.setDouble(4, high);
        statement.setDouble(5, low);
        statement.setDouble(6, close);

    }
}
