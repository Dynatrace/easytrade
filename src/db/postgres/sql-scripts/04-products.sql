CREATE TABLE "Products" (
    "Id" uuid NOT NULL DEFAULT gen_random_uuid(),
    "Name" varchar(50) NOT NULL,
    "Ppt" numeric(18, 8) NOT NULL,
    "Currency" varchar(10) NOT NULL,
    CONSTRAINT "PK_Products" PRIMARY KEY ("Id")
);
INSERT INTO "Products" (
    "Id",
    "Name",
    "Ppt",
    "Currency"
)
VALUES(
    'b0000000-0000-4000-8000-000000000001',
    'Share',
    5.9,
    'EUR'
),
(
    'b0000000-0000-4000-8000-000000000002',
    'ETF',
    2.5,
    'EUR'
),
(
    'b0000000-0000-4000-8000-000000000003',
    'Crypto',
    1.9,
    'EUR'
);
