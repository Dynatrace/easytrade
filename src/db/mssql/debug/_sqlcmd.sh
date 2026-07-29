#!/usr/bin/env bash
# Shared helper sourced by all debug scripts.
# Connects directly to the local MSSQL instance running in this container.
#
# Usage (from other scripts):
#   source "$(dirname "$0")/_sqlcmd.sh"
#   sqlcmd "SELECT 1"

SA_PASSWORD="${SA_PASSWORD:-yourStrong(!)Password}"

sqlcmd() {
    /opt/mssql-tools/bin/sqlcmd \
        -S localhost -U sa -P "$SA_PASSWORD" \
        -d TradeManagement \
        -W \
        -s "|" \
        -Q "$1"
}
