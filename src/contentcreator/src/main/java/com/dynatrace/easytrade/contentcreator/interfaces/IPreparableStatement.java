package com.dynatrace.easytrade.contentcreator.interfaces;

import java.sql.PreparedStatement;
import java.sql.SQLException;

public interface IPreparableStatement {
    /**
     * Takes in PreparedStatement and fills it with data
     * 
     * @param statement statement that will be filled with data from object
     * @throws SQLException
     */
    public void prepareInsertStatement(PreparedStatement statement) throws SQLException;
}
