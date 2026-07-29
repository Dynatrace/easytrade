USE [TradeManagement]
GO
        CREATE TABLE [dbo].[CreditCardOrderStatus] (
                [Id] UNIQUEIDENTIFIER NOT NULL DEFAULT NEWID(),
                [CreditCardOrderId] UNIQUEIDENTIFIER NOT NULL,
                [Timestamp] datetimeoffset(0) NOT NULL,
                [Status] VARCHAR(14) NOT NULL CHECK(
                        Status IN('order_created', 'card_ordered', 'card_created', 'card_error', 'card_shipped', 'card_delivered')
                ),
                [Details] nvarchar(255),
                CONSTRAINT [PK_CreditCardOrderStatus] PRIMARY KEY CLUSTERED ([Id] ASC) ON [PRIMARY],
                CONSTRAINT [FK_CreditCardOrderStatus_CreditCardOrders] FOREIGN KEY ([CreditCardOrderId]) REFERENCES CreditCardOrders([Id]) ON DELETE CASCADE
        )
GO