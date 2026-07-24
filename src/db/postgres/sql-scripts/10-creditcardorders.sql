CREATE TABLE "CreditCardOrders" (
    "Id" uuid NOT NULL DEFAULT gen_random_uuid(),
    "AccountId" uuid NOT NULL,
    "Email" varchar(255) NOT NULL,
    "Name" varchar(101) NOT NULL,
    "ShippingId" varchar(36),
    "ShippingAddress" varchar(255) NOT NULL,
    "CardLevel" VARCHAR(8) NOT NULL CHECK(
        lower("CardLevel") IN('silver', 'gold', 'platinum')
    ),
    CONSTRAINT "PK_CreditCardOrders" PRIMARY KEY ("Id"),
    CONSTRAINT "FK_CreditCardOrders_Accounts" FOREIGN KEY ("AccountId") REFERENCES "Accounts"("Id")
);
