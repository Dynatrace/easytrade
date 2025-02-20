#!/bin/bash

# Run Microsoft SQL Server and initialization script (at the same time)
/my-app/run-initialization.sh & /opt/mssql/bin/sqlservr
