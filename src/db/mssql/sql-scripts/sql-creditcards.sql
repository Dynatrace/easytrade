USE [TradeManagement]
GO
        CREATE TABLE [dbo].[CreditCards] (
                [Id] UNIQUEIDENTIFIER NOT NULL DEFAULT NEWID(),
                [CreditCardOrderId] UNIQUEIDENTIFIER NOT NULL,
                [Level] VARCHAR(8) NOT NULL CHECK(
                        Level IN('silver', 'gold', 'platinum')
                ),
                [Number] nvarchar(16) NOT NULL,
                [Cvs] nvarchar(3) NOT NULL,
                [ValidDate] datetimeoffset(0) NOT NULL,
                CONSTRAINT [PK_CreditCard] PRIMARY KEY CLUSTERED ([Id] ASC) ON [PRIMARY],
                CONSTRAINT [FK_CreditCard_CreditCardOrders] FOREIGN KEY ([CreditCardOrderId]) REFERENCES CreditCardOrders([Id]) ON DELETE CASCADE
        )
GO