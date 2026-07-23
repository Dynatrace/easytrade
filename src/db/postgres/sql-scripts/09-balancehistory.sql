;
CREATE TABLE "Balancehistory"(
    "Id" uuid NOT NULL DEFAULT gen_random_uuid(),
    "AccountId" uuid NOT NULL,
    "OldValue" numeric(18, 8) NOT NULL,
    "ValueChange" numeric(18, 8) NOT NULL,
    "ActionType" VARCHAR(14) NOT NULL CHECK(
        lower("ActionType") IN('withdraw', 'deposit', 'buy', 'sell', 'packagefee', 'transactionfee', 'collectfee', 'longbuy', 'longsell')
    ),
    "ActionDate" timestamptz NOT NULL,
    CONSTRAINT "PK_Balancehistory" PRIMARY KEY ("Id"),
    CONSTRAINT "FK_Balancehistory_Accounts" FOREIGN KEY ("AccountId") REFERENCES "Accounts"("Id") ON DELETE CASCADE
)
;
