package com.dynatrace.easytrade.creditcardorderservice.models;

import java.sql.*;
import java.time.OffsetDateTime;
import java.time.ZoneId;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

public record CreditCardOrderStatus(Integer id, String creditCardOrderId, OffsetDateTime timestamp, String status,
        String details) {

    private static final Logger logger = LoggerFactory.getLogger(CreditCardOrderStatus.class);

    public CreditCardOrderStatus(Integer id, String creditCardOrderId, OffsetDateTime timestamp, String status,
            String details) {
        this.id = id;
        this.creditCardOrderId = creditCardOrderId;
        this.timestamp = timestamp;
        this.status = status;
        this.details = details;
    }

    public static CreditCardOrderStatus fromResultSet(ResultSet rs) throws SQLException {
        int id = rs.getInt("Id");
        String orderId = rs.getString("CreditCardOrderId");
        Timestamp timestamp = rs.getTimestamp("Timestamp");
        String status = rs.getString("Status");
        String details = rs.getString("Details");
        OffsetDateTime datetime = OffsetDateTime.ofInstant(timestamp.toInstant(), ZoneId.of("UTC"));
        logger.debug("Creating [" + CreditCardOrderStatus.class + "] object with [id::" + id + "] [orderId::" + orderId
                + "] [date::" + datetime
                + "] [status::" + status + "] [details::" + details + "]");
        return new CreditCardOrderStatus(id, orderId, datetime, status, details);
    }
}
