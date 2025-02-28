package com.dynatrace.easytrade.contentcreator;

import com.dynatrace.easytrade.contentcreator.SQLQueryProvider.Conditions;
import com.dynatrace.easytrade.contentcreator.SQLQueryProvider.Queries;
import com.dynatrace.easytrade.contentcreator.models.Instruments;
import com.dynatrace.easytrade.contentcreator.models.Pricing;
import com.dynatrace.easytrade.contentcreator.models.SQLTables;
import com.microsoft.sqlserver.jdbc.StringUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.text.SimpleDateFormat;
import java.util.*;
import java.util.stream.Collectors;

import static com.dynatrace.easytrade.contentcreator.Constants.*;

public class ContentCreator {
    private static final Logger LOGGER = LoggerFactory.getLogger(ContentCreator.class);

    public static void main(String[] args) {
        LOGGER.info("Starting content creator");
        LOGGER.info("Getting the MSSQL_PATH environment variable");
        String mssqlPath = System.getenv("MSSQL_CONNECTIONSTRING");
        if (mssqlPath == null) {
            LOGGER.error("The environment variable MSSQL_CONNECTIONSTRING has not been set!");
            System.exit(1);
        }
        if (StringUtils.isEmpty(mssqlPath) == true) {
            LOGGER.error("The environment variable MSSQL_CONNECTIONSTRING is empty!");
            System.exit(2);
        }

        LOGGER.info("Initializing generator and connector");
        PricingDataGenerator generator = new PricingDataGenerator();
        SQLDatabaseConnector connector = new SQLDatabaseConnector(mssqlPath);
        // "jdbc:sqlserver://{IP_ADDRESS}:1433;database=TradeManagement;user=sa;password=yourStrong(!)Password;encrypt=false;trustServerCertificate=false;loginTimeout=30;"

        LOGGER.info("Testing if MSSQL connection works fine.");
        if (connector.testIfConnectionIsOk() == false) {
            LOGGER.error("The environment variable MSSQL_CONNECTIONSTRING contains a problematic connection string!");
            System.exit(3);
        }

        LOGGER.info("Initializing pricing data.");
        Calendar cal = initializePricingData(generator, connector);

        LOGGER.info("Generating constant pricing data");
        generatePricingData(generator, connector, cal);
    }

    /***
     * Clears all pricing data and generates 24h of data for all instruments
     * 
     * @param generator An instance of generator
     * @param connector An instance of database connector
     * @return The last date for which pricing data was generated
     */
    private static Calendar initializePricingData(PricingDataGenerator generator, SQLDatabaseConnector connector) {
        LOGGER.info("Clearing all data in pricing table");
        connector.deleteFromTable(SQLTables.PRICING);

        LOGGER.info("Generating data for the last 24h.");
        Calendar cal = Calendar.getInstance();
        cal.add(Calendar.DATE, -1);

        var pricingList = Arrays.stream(Instruments.values())
                .map(i -> generator.generateMassivePricingData(cal.getTime(), MINUTES_IN_DAY, i))
                .flatMap(Collection::stream).collect(Collectors.toList());

        LOGGER.info("Inserting data for the last day.");
        connector.insertBatchData(SQLTables.PRICING, Collections.unmodifiableList(pricingList), BATCH_SIZE);

        cal.add(Calendar.DATE, 1);
        cal.add(Calendar.MINUTE, -1);

        LOGGER.info("Inserting extra data if needed - because of time spent in this method.");
        Calendar calCurrent = Calendar.getInstance();
        while (calCurrent.get(Calendar.MINUTE) != cal.get(Calendar.MINUTE)) {
            cal.add(Calendar.MINUTE, 1);
            pricingList = generateAllPricingForGivenDate(cal.getTime(), generator);
            connector.insertBatchData(SQLTables.PRICING, Collections.unmodifiableList(pricingList), BATCH_SIZE);
        }

        return cal;
    }

    /***
     * Generate pricing data for all instruments each minute and remove old data
     * each 24h
     * 
     * @param generator An instance of generator
     * @param connector An instance of database connector
     * @param cal       The last date for which pricing data was generated
     */
    private static void generatePricingData(PricingDataGenerator generator, SQLDatabaseConnector connector,
            Calendar cal) {
        int i = 0;
        SimpleDateFormat dateFormatter = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss");

        LOGGER.info("Sleeping till next generation cycle according to millis difference");
        sleepProperly(cal);

        LOGGER.info("Starting endless generation loop with cleanup once per day.");
        while (true) {
            cal.add(Calendar.MINUTE, 1);
            i++;
            doEachMinute(generator, connector, cal, dateFormatter);
            if (i > MINUTES_IN_DAY) {
                i = 0;
                doEachDay(generator, connector, dateFormatter);
            }
            sleepProperly(cal);
        }
    }

    private static void doEachMinute(PricingDataGenerator generator, SQLDatabaseConnector connector,
            Calendar calendar, SimpleDateFormat dateFormatter) {
        generatePricingData(connector, generator, dateFormatter, calendar);
    }

    private static void doEachDay(PricingDataGenerator generator, SQLDatabaseConnector connector,
            SimpleDateFormat dateFormatter) {
        LOGGER.info("Generator is running for a whole day. Running daily tasks.");
        removeOldPricingData(connector, dateFormatter);
        removeExcessiveTradeData(connector);
        removeExcessiveBalanceHistoryData(connector);
        removeInactiveAccounts(connector);
        removeExcessiveAccounts(connector, MAX_ACCOUNT_COUNT, CLEANUP_RATIO);
    }

    private static void generatePricingData(SQLDatabaseConnector connector, PricingDataGenerator generator,
            SimpleDateFormat dateFormatter, Calendar calendar) {
        LOGGER.info("Generating and inserting pricing data for time [{}] ", dateFormatter.format(calendar.getTime()));
        List<Pricing> pricingData = generateAllPricingForGivenDate(calendar.getTime(), generator);
        connector.insertBatchData(SQLTables.PRICING, Collections.unmodifiableList(pricingData), BATCH_SIZE);
    }

    private static void removeOldPricingData(SQLDatabaseConnector connector, SimpleDateFormat dateFormatter) {
        Calendar calendar = Calendar.getInstance();
        calendar.setTime(new Date());
        calendar.add(Calendar.DATE, -1);
        LOGGER.info("Removing pricing data before [{}]", dateFormatter.format(calendar.getTime()));
        connector.deleteFromTableBeforeDate(SQLTables.PRICING, calendar.getTime());
    }

    private static void removeExcessiveTradeData(SQLDatabaseConnector connector) {
        if (connector.checkTableCount(SQLTables.TRADES, MAX_TRADES_COUNT)) {
            connector.deleteFromTableTop(SQLTables.TRADES, (int) (MAX_TRADES_COUNT * CLEANUP_RATIO));
        }
    }

    private static void removeExcessiveBalanceHistoryData(SQLDatabaseConnector connector) {
        if (connector.checkTableCount(SQLTables.BALANCE_HISTORY, MAX_BALANCE_COUNT)) {
            connector.deleteFromTableTop(SQLTables.BALANCE_HISTORY, (int) (MAX_BALANCE_COUNT * CLEANUP_RATIO));
        }
    }

    /**
     * Select all inactive accounts and deletes them from database
     * 
     * @param connector
     */
    private static void removeInactiveAccounts(SQLDatabaseConnector connector) {
        LOGGER.info("Looking for inactive accounts");
        String selectQuery = Queries.selectFromTable(SQLTables.ACCOUNTS, Conditions.nonPresetInactiveAccounts());
        String deleteQuery = Queries.deleteSelected(selectQuery);
        int affectedCount = connector.executeUpdateQuery(deleteQuery);
        LOGGER.info("Removed [{}] inactive accounts", affectedCount);
    }

    /**
     * Selects top {count} oldest active accounts and marks them as inactive
     * 
     * @param connector
     * @param count
     */
    private static void markExcessiveAccountsAsInactive(SQLDatabaseConnector connector, Integer count) {
        String selectQuery = Queries.selectTopOldestAccounts(count, Conditions.nonPresetActiveAccounts());
        String updateQuery = Queries.updateAccountStatus(selectQuery, false);
        int affectedCount = connector.executeUpdateQuery(updateQuery);
        LOGGER.info("Marked [{}] accounts as inactive", affectedCount);
    }

    /**
     * Checks the if the amount of active accounts exceeds the {limit}
     * if it does, marks part of the accounts as inactive, dictated by the
     * {cleanupRatio}
     * 
     * @param connector
     * @param limit
     * @param cleanupRatio
     */
    private static void removeExcessiveAccounts(SQLDatabaseConnector connector, Integer limit, Double cleanupRatio) {
        int tableCount = connector.getTableCount(SQLTables.ACCOUNTS, Conditions.nonPresetActiveAccounts());
        LOGGER.info("Number of non-preset accounts [{}], of max allowed [{}]", tableCount, limit);
        if (tableCount > limit) {
            markExcessiveAccountsAsInactive(connector, Double.valueOf(limit * cleanupRatio).intValue());
        }
    }

    /***
     * Method sleeps for 60 seconds including the execution time of inserts. This
     * way we always generate data
     * at the same second of each minute
     * 
     * @param cal The current generation time
     */
    private static void sleepProperly(Calendar cal) {
        sleepProperly(Long.valueOf(60000), cal);
    }

    /***
     * Sleep for {sleepTimeMs} ms minus the difference between current time and time
     * in {cal}
     * 
     * @param sleepTimeMs Base time to sleep in MS
     * @param cal         The current generation time
     */
    private static void sleepProperly(Long sleepTimeMs, Calendar cal) {
        try {
            Long timeout = sleepTimeMs - (System.currentTimeMillis() - cal.getTimeInMillis());
            Thread.sleep(timeout > 0 ? timeout : 0);
        } catch (InterruptedException e) {
            e.printStackTrace();
            Thread.currentThread().interrupt();
        }
    }

    /***
     * Generate a new value for each Instrument
     * 
     * @param date      The date to generate the price for
     * @param generator Price generator
     * @return
     */
    private static List<Pricing> generateAllPricingForGivenDate(Date date, PricingDataGenerator generator) {
        return Arrays.stream(Instruments.values())
                .map(instrument -> generator.generateSinglePricingData(date, instrument))
                .collect(Collectors.toList());
    }
}
