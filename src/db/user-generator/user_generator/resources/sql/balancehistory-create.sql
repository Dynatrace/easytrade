USE [TradeManagement]
GO
CREATE TABLE [dbo].[Balancehistory](
    [Id] INT IDENTITY(1, 1) NOT NULL,
    [AccountId] INT NOT NULL,
    [OldValue] DECIMAL (18, 8) NOT NULL,
    [ValueChange] DECIMAL (18, 8) NOT NULL,
    [ActionType] VARCHAR(14) NOT NULL CHECK(
        ActionType IN('withdraw', 'deposit', 'buy', 'sell', 'packagefee', 'transactionfee', 'collectfee', 'longbuy', 'longsell')
    ),
    [ActionDate] datetimeoffset(0) NOT NULL,
    CONSTRAINT [PK_Balancehistory] PRIMARY KEY CLUSTERED ([Id] ASC) ON [PRIMARY],
    CONSTRAINT [FK_Balancehistory_Accounts] FOREIGN KEY ([AccountId]) REFERENCES [Accounts]([Id]) ON DELETE CASCADE
)
GO
