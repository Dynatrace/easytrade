CREATE TABLE "CreditCards" (
    "Id" uuid NOT NULL DEFAULT gen_random_uuid(),
    "CreditCardOrderId" uuid NOT NULL,
    "Level" VARCHAR(8) NOT NULL CHECK(
        lower("Level") IN('silver', 'gold', 'platinum')
    ),
    "Number" varchar(16) NOT NULL,
    "Cvs" varchar(3) NOT NULL,
    "ValidDate" timestamptz NOT NULL,
    CONSTRAINT "PK_CreditCard" PRIMARY KEY ("Id"),
    CONSTRAINT "FK_CreditCard_CreditCardOrders" FOREIGN KEY ("CreditCardOrderId") REFERENCES "CreditCardOrders"("Id") ON DELETE CASCADE
);
