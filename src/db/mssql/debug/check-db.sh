#!/usr/bin/env bash
# Usage: check-db.sh
# Shows row counts for all tables, all accounts with balances,
# and the latest price per instrument.

set -euo pipefail

source "$(dirname "$0")/_sqlcmd.sh"

echo "=== Row Counts ==="
sqlcmd "
SELECT 'Accounts'          AS [Table], COUNT(*) AS [Rows] FROM [dbo].[Accounts]
UNION ALL
SELECT 'Balance',                       COUNT(*)           FROM [dbo].[Balance]
UNION ALL
SELECT 'BalanceHistory',                COUNT(*)           FROM [dbo].[BalanceHistory]
UNION ALL
SELECT 'Instruments',                   COUNT(*)           FROM [dbo].[Instruments]
UNION ALL
SELECT 'OwnedInstruments',              COUNT(*)           FROM [dbo].[Ownedinstruments]
UNION ALL
SELECT 'Packages',                      COUNT(*)           FROM [dbo].[Packages]
UNION ALL
SELECT 'Pricing',                       COUNT(*)           FROM [dbo].[Pricing]
UNION ALL
SELECT 'Products',                      COUNT(*)           FROM [dbo].[Products]
UNION ALL
SELECT 'Trades',                        COUNT(*)           FROM [dbo].[Trades]
UNION ALL
SELECT 'CreditCardOrders',              COUNT(*)           FROM [dbo].[CreditCardOrders]
UNION ALL
SELECT 'CreditCardOrderStatus',         COUNT(*)           FROM [dbo].[CreditCardOrderStatus]
UNION ALL
SELECT 'CreditCards',                   COUNT(*)           FROM [dbo].[CreditCards]
ORDER BY [Table];
"

echo ""
echo "=== Accounts ==="
sqlcmd "
SELECT
    a.[Id],
    a.[Username],
    a.[Origin],
    b.[Value] AS [Balance]
FROM [dbo].[Accounts] a
LEFT JOIN [dbo].[Balance] b ON b.[AccountId] = a.[Id]
ORDER BY a.[Id];
"

echo ""
echo "=== Latest Price Per Instrument ==="
sqlcmd "
SELECT
    i.[Code] AS [Instrument],
    p.[Timestamp],
    p.[Open],
    p.[High],
    p.[Low],
    p.[Close]
FROM [dbo].[Pricing] p
JOIN [dbo].[Instruments] i ON i.[Id] = p.[InstrumentId]
WHERE p.[Id] IN (
    SELECT MAX([Id]) FROM [dbo].[Pricing] GROUP BY [InstrumentId]
)
ORDER BY i.[Id];
"
