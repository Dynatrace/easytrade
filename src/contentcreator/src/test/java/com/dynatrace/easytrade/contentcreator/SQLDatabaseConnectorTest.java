package com.dynatrace.easytrade.contentcreator;

import com.dynatrace.easytrade.contentcreator.models.Instruments;
import com.dynatrace.easytrade.contentcreator.models.Pricing;
import com.dynatrace.easytrade.contentcreator.models.SQLTables;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.sql.PreparedStatement;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.Collections;
import java.util.Date;

import static org.mockito.ArgumentMatchers.anyInt;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;


public class SQLDatabaseConnectorTest {
    private Logger LOGGER = LoggerFactory.getLogger(PricingDataGeneratorTest.class);

    @DisplayName("Test if insert batch data saves all data correctly")
    @Test
    void insertBatchDataTest() throws SQLException {
        final int RECORDS_GENERATED = 74;
        final int BATCH_SIZE = 10;

        LOGGER.info("Preparing the needed objects");
        SQLDatabaseConnector connector = new SQLDatabaseConnector("");
        PricingDataGenerator generator = new PricingDataGenerator();
        Date now = new Date();
        ArrayList<Pricing> dataList = generator.generateMassivePricingData(now, RECORDS_GENERATED, Instruments.BATBAT);

        LOGGER.info("Mocking the preparedStatement");
        final PreparedStatement preparedStatement = mock(PreparedStatement.class);

        LOGGER.info("Setting up the mock behaviour of the needed methods");
        doNothing().when(preparedStatement).setString(anyInt(), anyString());
        doNothing().when(preparedStatement).setInt(anyInt(), anyInt());
        doNothing().when(preparedStatement).setDouble(anyInt(), anyDouble());
        doNothing().when(preparedStatement).addBatch();
        when(preparedStatement.executeBatch()).thenReturn(null);

        LOGGER.info("Invoking the logic");
        connector.insertBatchDataLogic(
                SQLTables.PRICING.getInsertQuery(), Collections.unmodifiableList(dataList),
                BATCH_SIZE, preparedStatement);

        LOGGER.info("Verifying that the number of invocations are correct.");
        verify(preparedStatement, times(RECORDS_GENERATED)).setString(anyInt(), anyString());
        verify(preparedStatement, times(RECORDS_GENERATED)).setInt(anyInt(), anyInt());
        verify(preparedStatement, times(RECORDS_GENERATED * 4)).setDouble(anyInt(), anyDouble());
        verify(preparedStatement, times(RECORDS_GENERATED)).addBatch();
        verify(preparedStatement, times((RECORDS_GENERATED / BATCH_SIZE) + 1)).executeBatch();
    }
}
