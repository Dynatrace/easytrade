;
        CREATE TABLE "Pricing" (
                "Id" uuid NOT NULL DEFAULT gen_random_uuid(),
                "InstrumentId" uuid NOT NULL,
                "Timestamp" timestamptz NOT NULL,
                "Open" numeric(18, 8) NOT NULL,
                "High" numeric(18, 8) NOT NULL,
                "Low" numeric(18, 8) NOT NULL,
                "Close" numeric(18, 8) NOT NULL,
                CONSTRAINT "PK_Pricing" PRIMARY KEY ("Id"),
                CONSTRAINT "FK_Pricing_Instruments" FOREIGN KEY ("InstrumentId") REFERENCES "Instruments"("Id")
        )
;

-- Seed one initial price per instrument so the broker-service can serve
-- instrument data immediately on startup (before contentcreator runs).
-- Values are the time0 (00:00) anchor prices from contentcreator's Instruments.java.
-- open = close = high = low so the candle is flat but valid.
INSERT INTO "Pricing" ("Timestamp", "InstrumentId", "Open", "High", "Low", "Close")
VALUES
    (now(), 'c0000000-0000-4000-8000-000000000001',  150.0000,    150.0000,    150.0000,    150.0000   ),  -- EASYTRAVEL
    (now(), 'c0000000-0000-4000-8000-000000000002',   73.0000,     73.0000,     73.0000,     73.0000   ),  -- EASYPLANES
    (now(), 'c0000000-0000-4000-8000-000000000003',   25.0000,     25.0000,     25.0000,     25.0000   ),  -- EASYHOTELS
    (now(), 'c0000000-0000-4000-8000-000000000004',    0.21700000,  0.21700000,  0.21700000,  0.21700000),  -- JANGRP
    (now(), 'c0000000-0000-4000-8000-000000000005',    0.24400000,  0.24400000,  0.24400000,  0.24400000),  -- CORFIG
    (now(), 'c0000000-0000-4000-8000-000000000006',    2.17400000,  2.17400000,  2.17400000,  2.17400000),  -- CMRTIN
    (now(), 'c0000000-0000-4000-8000-000000000007',    1.12700000,  1.12700000,  1.12700000,  1.12700000),  -- CHAMAT
    (now(), 'c0000000-0000-4000-8000-000000000008',   10.02100000, 10.02100000, 10.02100000, 10.02100000),  -- BLSTCR
    (now(), 'c0000000-0000-4000-8000-000000000009',    4.61300000,  4.61300000,  4.61300000,  4.61300000),  -- CAFGAL
    (now(), 'c0000000-0000-4000-8000-000000000010',    0.88700000,  0.88700000,  0.88700000,  0.88700000),  -- DECGRP
    (now(), 'c0000000-0000-4000-8000-000000000011',    4.09500000,  4.09500000,  4.09500000,  4.09500000),  -- PETBAN
    (now(), 'c0000000-0000-4000-8000-000000000012',    8.89100000,  8.89100000,  8.89100000,  8.89100000),  -- BATBAT
    (now(), 'c0000000-0000-4000-8000-000000000013',    0.46200000,  0.46200000,  0.46200000,  0.46200000),  -- STOLLC
    (now(), 'c0000000-0000-4000-8000-000000000014',    0.11200000,  0.11200000,  0.11200000,  0.11200000),  -- LEBRGA
    (now(), 'c0000000-0000-4000-8000-000000000015',    0.09970000,  0.09970000,  0.09970000,  0.09970000)   -- MOROBA
;
