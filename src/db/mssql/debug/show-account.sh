#!/usr/bin/env bash
# Usage: show-account.sh <account-id>
# Shows account details, balance, and owned instruments for a given account ID.

set -euo pipefail

if [[ $# -ne 1 || ! "$1" =~ ^[0-9]+$ ]]; then
    echo "Usage: $0 <account-id>" >&2
    exit 1
fi

ACCOUNT_ID="$1"
source "$(dirname "$0")/_sqlcmd.sh"

echo "=== Account #${ACCOUNT_ID} ==="
sqlcmd "
SELECT
    a.[Id],
    a.[FirstName],
    a.[LastName],
    a.[Username],
    a.[Email],
    a.[Origin],
    a.[AccountActive],
    b.[Value] AS [Balance]
FROM [dbo].[Accounts] a
LEFT JOIN [dbo].[Balance] b ON b.[AccountId] = a.[Id]
WHERE a.[Id] = ${ACCOUNT_ID};
"

echo ""
echo "=== Owned Instruments ==="
sqlcmd "
SELECT
    i.[Code]         AS [Instrument],
    i.[Name],
    oi.[Quantity],
    oi.[LastModificationDate]
FROM [dbo].[Ownedinstruments] oi
JOIN [dbo].[Instruments] i ON i.[Id] = oi.[InstrumentId]
WHERE oi.[AccountId] = ${ACCOUNT_ID}
ORDER BY i.[Id];
"
