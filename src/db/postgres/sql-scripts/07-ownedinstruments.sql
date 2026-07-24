CREATE TABLE "Ownedinstruments"(
    "Id" uuid NOT NULL DEFAULT gen_random_uuid(),
    "AccountId" uuid NOT NULL,
    "InstrumentId" uuid NOT NULL,
    "Quantity" numeric(18, 8) NOT NULL,
    "LastModificationDate" timestamptz,
    CONSTRAINT "PK_Ownedinstruments" PRIMARY KEY ("Id"),
    CONSTRAINT "FK_Ownedinstruments_Accounts" FOREIGN KEY ("AccountId") REFERENCES "Accounts"("Id") ON DELETE CASCADE,
    CONSTRAINT "FK_Ownedinstruments_Instruments" FOREIGN KEY ("InstrumentId") REFERENCES "Instruments"("Id")
);
-- INTERNAL accounts start with 0; PRESET accounts get a random quantity in [1, 100]
INSERT INTO "Ownedinstruments" ("AccountId", "InstrumentId", "Quantity", "LastModificationDate")
SELECT
    a."Id",
    i."Id",
    CASE
        WHEN a."Origin" = 'INTERNAL' THEN 0
        ELSE floor(random() * 100) + 1
    END,
    now()
FROM "Accounts" a
CROSS JOIN "Instruments" i;
