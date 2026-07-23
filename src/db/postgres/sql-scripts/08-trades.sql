;
CREATE TABLE "Trades" (
    "Id" uuid NOT NULL DEFAULT gen_random_uuid(),
    "AccountId" uuid NOT NULL,
    "InstrumentId" uuid NOT NULL,
    "Direction" varchar(8) NOT NULL CHECK(lower("Direction") IN('buy', 'sell', 'longbuy', 'longsell')),
    "Quantity" numeric(18, 8) NOT NULL,
    "EntryPrice" numeric(18, 8) NOT NULL,
    "TimestampOpen" timestamptz NOT NULL,
    "TimestampClose" timestamptz,
    "TradeClosed" boolean,
    "TransactionHappened" boolean,
    "Status" varchar(255) NOT NULL,
    CONSTRAINT "PK_Trades" PRIMARY KEY ("Id"),
    CONSTRAINT "FK_Trades_Accounts" FOREIGN KEY ("AccountId") REFERENCES "Accounts"("Id") ON DELETE CASCADE,
    CONSTRAINT "FK_Trades_Instruments" FOREIGN KEY ("InstrumentId") REFERENCES "Instruments"("Id")
)
;
