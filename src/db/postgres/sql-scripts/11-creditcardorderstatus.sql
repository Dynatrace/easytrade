CREATE TABLE "CreditCardOrderStatus" (
    "Id" uuid NOT NULL DEFAULT gen_random_uuid(),
    "CreditCardOrderId" uuid NOT NULL,
    "Timestamp" timestamptz NOT NULL,
    "Status" VARCHAR(14) NOT NULL CHECK(
        lower("Status") IN('order_created', 'card_ordered', 'card_created', 'card_error', 'card_shipped', 'card_delivered')
    ),
    "Details" varchar(255),
    CONSTRAINT "PK_CreditCardOrderStatus" PRIMARY KEY ("Id"),
    CONSTRAINT "FK_CreditCardOrderStatus_CreditCardOrders" FOREIGN KEY ("CreditCardOrderId") REFERENCES "CreditCardOrders"("Id") ON DELETE CASCADE
);
