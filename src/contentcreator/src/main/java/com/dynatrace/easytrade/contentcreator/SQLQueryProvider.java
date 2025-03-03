package com.dynatrace.easytrade.contentcreator;

import com.dynatrace.easytrade.contentcreator.models.SQLTables;

public class SQLQueryProvider {
    public static class Queries {
        public static String selectFromTable(SQLTables table, String conditionString) {
            return "SELECT * FROM " + table.getName() + " " + conditionString;
        }

        public static String selectTopOldestAccounts(Integer count, String conditionString) {
            return "SELECT TOP(" + count + ") * FROM " + SQLTables.ACCOUNTS.getName()
                    + " " + conditionString + " ORDER BY CreationDate DESC";
        }

        public static String selectTopOldestAccounts(Integer count) {
            return selectTopOldestAccounts(count, Conditions.emptyCondition());
        }

        public static String updateAccountStatus(String selectQuery, boolean status) {
            return "WITH T AS (" + selectQuery + ") UPDATE T SET AccountActive=" + (status ? 1 : 0);
        }

        public static String deleteSelected(String selectQuery) {
            return "WITH T AS (" + selectQuery + ") DELETE FROM T";
        }
    }

    public static class Conditions {
        public static String nonPresetActiveAccounts() {
            return "WHERE (AccountActive=1 AND Origin<>'PRESET')";
        }

        public static String nonPresetInactiveAccounts() {
            return "WHERE (AccountActive=0 AND Origin<>'PRESET')";
        }

        public static String emptyCondition() {
            return "";
        }
    }

}
