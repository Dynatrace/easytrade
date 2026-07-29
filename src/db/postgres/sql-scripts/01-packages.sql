CREATE TABLE "Packages" (
    "Id" uuid NOT NULL DEFAULT gen_random_uuid(),
    "Name" varchar(50) NOT NULL,
    "Price" numeric(18, 8) NOT NULL,
    "Support" varchar(255) NOT NULL,
    CONSTRAINT "PK_Packages" PRIMARY KEY ("Id")
);
INSERT INTO "Packages"(
    "Id",
    "Name",
    "Price",
    "Support"
)
VALUES
(
    'a0000000-0000-4000-8000-000000000001',
    'Starter',
    0.0,
    '[''Email'']'
),
(
    'a0000000-0000-4000-8000-000000000002',
    'Light',
    24.99,
    '[''Email'',''Hotline'']'
),
(
    'a0000000-0000-4000-8000-000000000003',
    'Pro',
    49.99,
    '[''Email'',''Hotline'',''AccountManager'']'
);
