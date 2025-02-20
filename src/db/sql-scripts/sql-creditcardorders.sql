USE [TradeManagement]
GO
        CREATE TABLE [dbo].[CreditCardOrders] (
                [Id] nvarchar(36) NOT NULL,
                [AccountId] INT NOT NULL,
                [Email] nvarchar(255) NOT NULL,
                [Name] nvarchar(101) NOT NULL,
                [ShippingId] nvarchar(36),
                [ShippingAddress] nvarchar(255) NOT NULL,
                [CardLevel] VARCHAR(8) NOT NULL CHECK(
                        CardLevel IN('silver', 'gold', 'platinum')
                ), 
                CONSTRAINT [PK_CreditCardOrders] PRIMARY KEY ([Id]), 
                CONSTRAINT [FK_CreditCardOrders_Accounts] FOREIGN KEY ([AccountId]) REFERENCES Accounts([Id])
        )
GO