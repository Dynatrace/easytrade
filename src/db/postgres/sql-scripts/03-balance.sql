;
CREATE TABLE "Balance" (
    "AccountId" uuid NOT NULL,
    "Value" numeric(18, 8) NOT NULL,
    CONSTRAINT "PK_Balance" PRIMARY KEY ("AccountId"),
    CONSTRAINT "FK_Balance_Accounts" FOREIGN KEY ("AccountId") REFERENCES "Accounts"("Id") ON DELETE CASCADE 
)
;
INSERT INTO "Balance" ("AccountId", "Value")
SELECT "Id", CASE WHEN "Origin" = 'INTERNAL' THEN 0.00 ELSE 10000.00 END
FROM "Accounts";
