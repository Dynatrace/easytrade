package com.dynatrace.easytrade.contentcreator;

import com.dynatrace.easytrade.contentcreator.interfaces.IPreparableStatement;
import com.dynatrace.easytrade.contentcreator.models.SQLTables;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.sql.*;
import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.List;
import java.util.NoSuchElementException;

public class SQLDatabaseConnector {
    private static final Logger LOGGER = LoggerFactory.getLogger(SQLDatabaseConnector.class);
    private final String CONNECTION_OK_SQL = "SELECT TOP 10 Id FROM Accounts";
    private final SimpleDateFormat dateFormatter = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss");

    private final String connectionUrl;

    public SQLDatabaseConnector(String connectionUrl) {
        this.connectionUrl = connectionUrl;
    }

    /***
     * Checks if MSSQL connection string is correct by performing a fast SELECT
     * statement
     * 
     * @return True if connection is OK, false if something does not work
     */
    public boolean testIfConnectionIsOk() {
        try (Connection connection = DriverManager.getConnection(connectionUrl);
                Statement statement = connection.createStatement();) {

            ResultSet resultSet = statement.executeQuery(CONNECTION_OK_SQL);
            return resultSet.next();
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return false;
    }

    /**
     * Insert a single row of data into the table
     * 
     * @param table
     * @param data
     */
    public void insertRow(SQLTables table, IPreparableStatement data) {
        try (var connection = DriverManager.getConnection(connectionUrl);
                var preparedStatement = connection.prepareStatement(table.getInsertQuery(),
                        Statement.RETURN_GENERATED_KEYS);) {

            data.prepareInsertStatement(preparedStatement);

            preparedStatement.execute();
            ResultSet resultSet = preparedStatement.getGeneratedKeys();

            if (resultSet.next() == false) {
                System.out.println("There was a problem inserting data into table " + table.getName());
                System.out.println(data);
            }
            LOGGER.trace("Generated: " + resultSet.getString(1));
        } catch (SQLException e) {
            e.printStackTrace();
        } catch (NoSuchElementException e) {
            LOGGER.error("Can't get insert query for table [{}]", table.getName(), e);
        }
    }

    /**
     * Insert all rows from data to database using batches
     * 
     * @param table
     * @param data
     * @param batchSize
     */
    public void insertBatchData(SQLTables table, List<IPreparableStatement> data, int batchSize) {
        try (var connection = DriverManager.getConnection(connectionUrl);
                var preparedStatement = connection.prepareStatement(table.getInsertQuery());) {
            insertBatchDataLogic(table.getName(), data, batchSize, preparedStatement);
        } catch (SQLException e) {
            e.printStackTrace();
        } catch (NoSuchElementException e) {
            LOGGER.error("Can't get insert query for table [{}]", table.getName(), e);
        }
    }

    /**
     * For tests only, should not be called by itself
     */
    public void insertBatchDataLogic(String tableName, List<IPreparableStatement> data, int batchSize,
            PreparedStatement preparedStatement) {
        try {
            for (int i = 0; i < data.size(); i++) {
                data.get(i).prepareInsertStatement(preparedStatement);
                preparedStatement.addBatch();

                if ((i + 1) % batchSize == 0) {
                    preparedStatement.executeBatch();
                    LOGGER.trace("Executing inserts for table [{}], batch no [{}] ", tableName, i);
                }
            }
            preparedStatement.executeBatch();
            LOGGER.trace("Executing the last batch insert for table [{}], total data size [{}]", tableName,
                    data.size());
        } catch (SQLException e) {
            e.printStackTrace();
        }
    }

    /**
     * Return the number of rows in table or -1 if error occured
     * 
     * @param table SQLTables instance
     * @return number of rows in table or -1
     */
    public int getTableCount(SQLTables table) {
        return getTableCount(table, "");
    }

    /**
     * Return the number of rows in table or -1 if error occured
     * 
     * @param table           SQLTables instance
     * @param conditionString "WHERE x" string that specifies the condition for the
     *                        query
     * @return number of rows in table or -1
     */
    public int getTableCount(SQLTables table, String conditionString) {
        var queryString = table.getCountCheckQuery(conditionString);
        try (var connection = DriverManager.getConnection(connectionUrl);
                var preparedStatement = connection.prepareStatement(queryString);) {
            var resultSet = preparedStatement.executeQuery();
            if (resultSet.next()) {
                return resultSet.getInt("COUNT");
            }
            LOGGER.warn("Couldn't get count data for table [{}] using query [{}]", table.getName(), queryString);
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return -1;
    }

    /**
     * Delete n top rows in table
     * 
     * @param table
     * @param n
     */
    public void deleteFromTableTop(SQLTables table, int n) {
        deleteFromTableTop(table, n, "");
    }

    /**
     * Delete n top rows in table
     * 
     * @param table
     * @param n
     * @param conditionString "WHERE x" string that specifies the condition for the
     *                        query
     */
    public void deleteFromTableTop(SQLTables table, int n, String conditionString) {
        var queryString = table.getDeleteTopQuery(conditionString);
        LOGGER.info("Deleting [{}] entries from table [{}]", n, table.getName());
        try (var connection = DriverManager.getConnection(connectionUrl);
                var preparedStatement = connection.prepareStatement(queryString);) {
            preparedStatement.setInt(1, n);
            preparedStatement.executeUpdate();
        } catch (SQLException e) {
            e.printStackTrace();
        }
    }

    /**
     * Delete all rows in table that come before specified date
     * Table needs to specify which column is used for this comparison
     * 
     * @param table
     * @param date
     */
    public void deleteFromTableBeforeDate(SQLTables table, Date date) {
        try (var connection = DriverManager.getConnection(connectionUrl);
                var preparedStatement = connection.prepareStatement(table.getDeleteBeforeDateQuery());) {
            preparedStatement.setString(1, dateFormatter.format(date));
            preparedStatement.executeUpdate();
        } catch (SQLException e) {
            e.printStackTrace();
        } catch (NoSuchElementException e) {
            LOGGER.error("Can't get [DeleteBeforeDate] query for table [{}]", table.getName(), e);
        }
    }

    /**
     * Return true if amount of rows in table is exceeding specified max count
     * 
     * @param table
     * @param maxCount
     * @return
     */
    public boolean checkTableCount(SQLTables table, int maxCount) {
        var count = getTableCount(table);
        LOGGER.info("Table [{}] has [{}] entries of [{}] max allowed", table.getName(), count, maxCount);
        return count > maxCount;
    }

    /**
     * Delete all rows in table
     * 
     * @param table
     */
    public void deleteFromTable(SQLTables table) {
        var queryString = table.getDeleteQuery();
        try (var connection = DriverManager.getConnection(connectionUrl);
                var preparedStatement = connection.prepareStatement(queryString);) {
            preparedStatement.executeUpdate();
        } catch (SQLException e) {
            e.printStackTrace();
        }
    }

    public int executeUpdateQuery(String queryString){
        LOGGER.info("Running query string [{}]", queryString);
        try (var connection = DriverManager.getConnection(connectionUrl);
                var preparedStatement = connection.prepareStatement(queryString);) {
            return preparedStatement.executeUpdate();
        } catch (SQLException e) {
            e.printStackTrace();
            return -1;
        }
    }

    public void updateAccountStatus(SQLTables table, String status) {
        var queryString = table.getDeleteQuery();
        try (var connection = DriverManager.getConnection(connectionUrl);
                var preparedStatement = connection.prepareStatement(queryString);) {
            preparedStatement.setString(1, status);
            preparedStatement.executeUpdate();
        } catch (SQLException e) {
            e.printStackTrace();
        }
    }
}