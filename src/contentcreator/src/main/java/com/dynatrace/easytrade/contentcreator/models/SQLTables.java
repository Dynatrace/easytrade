package com.dynatrace.easytrade.contentcreator.models;

import java.util.Optional;

import com.dynatrace.easytrade.contentcreator.SQLQueryProvider.Conditions;

import java.util.NoSuchElementException;

public enum SQLTables {
    ACCOUNTS("[dbo].[Accounts]"),
    BALANCE_HISTORY("[dbo].[Balancehistory]", "[ActionDate]"),
    INSTRUMENTS("[dbo].[Instruments]"),
    OWNED_INSTRUMENTS("[dbo].[Ownedinstruments]"),
    PRICING("[dbo].[Pricing]", "[Timestamp]", "([Timestamp], [InstrumentId], [Open], [High], [Low], [Close])",
            "(?, ?, ?, ?, ?, ?)"),
    TRADES("[dbo].[Trades]", "[TimestampOpen]");

    private final String name;
    private final Optional<String> dateField;
    private final Optional<String> insertPattern;
    private final Optional<String> insertColumns;

    SQLTables(String name, String dateField) {
        this.name = name;
        this.dateField = Optional.of(dateField);
        this.insertColumns = Optional.empty();
        this.insertPattern = Optional.empty();
    }

    SQLTables(String name) {
        this.name = name;
        this.dateField = Optional.empty();
        this.insertColumns = Optional.empty();
        this.insertPattern = Optional.empty();
    }

    SQLTables(String name, String dateField, String insertColumns, String insertPattern) {
        this.name = name;
        this.dateField = Optional.of(dateField);
        this.insertColumns = Optional.of(insertColumns);
        this.insertPattern = Optional.of(insertPattern);
    }

    public String getName() {
        return name;
    }

    public Optional<String> getDateField() {
        return dateField;
    }

    public Optional<String> getFullDateField() {
        if (dateField.isPresent()) {
            return Optional.of(name + "." + dateField.get());
        }
        return Optional.empty();
    }

    /**
     * SQL query that returns count of rows in table
     * Value is returned in column "COUNT"
     * 
     * @return String representing SQL query
     */
    public String getCountCheckQuery() {
        return "SELECT COUNT(Id) AS [COUNT] FROM " + name;
    }

    /**
     * SQL query that returns count of rows in table
     * Value is returned in column "COUNT"
     * 
     * @param conditionString "WHERE x" string that specifies the condition for the
     *                        query
     * @return String representing SQL query
     */
    public String getCountCheckQuery(String conditionString) {
        return "SELECT COUNT(Id) AS [COUNT] FROM " + name + " " + conditionString;
    }

    /**
     * SQL that deletes top n rows
     * If Table have column for timestamp, the rows will be ordered by that column
     * 
     * @return
     */
    public String getDeleteTopQuery() {
        if (dateField.isEmpty()) {
            return "DELETE TOP (?) FROM " + name;
        }
        return "WITH T AS (SELECT TOP (?) * FROM " + name + " ORDER BY " + dateField.get() + ") DELETE FROM T";
    }

    /**
     * SQL that deletes top n rows
     * If Table have column for timestamp, the rows will be ordered by that column
     * 
     * @param conditionString "WHERE x" string that specifies the condition for the
     *                        query
     * @return
     */
    public String getDeleteTopQuery(String conditionString) {
        if (dateField.isEmpty()) {
            return "DELETE TOP (?) FROM " + name;
        }
        return "WITH T AS (SELECT TOP (?) * FROM " + name + " " + conditionString + " ORDER BY " + dateField.get()
                + ") DELETE FROM T";
    }

    public String getDeleteQuery() {
        return getDeleteQuery(Conditions.emptyCondition());
    }
    public String getDeleteQuery(String conditionString){
        return "DELETE FROM " + name + " " + conditionString;
    }

    public String getDeleteBeforeDateQuery() throws NoSuchElementException {
        return "DELETE FROM " + name + " WHERE " + dateField.orElseThrow() + " < ?";
    }

    public Optional<String> getInsertPattern() {
        return insertPattern;
    }

    public Optional<String> getInsertColumns() {
        return insertColumns;
    }

    /**
     * Returns a SQL query for inserting data into the table that can be used in
     * PreaparedStatement
     * 
     * @return
     * @throws NoSuchElementException
     */
    public String getInsertQuery() throws NoSuchElementException {
        return "INSERT INTO " + name + insertColumns.orElseThrow() + " VALUES " + insertPattern.orElseThrow();
    }
}
